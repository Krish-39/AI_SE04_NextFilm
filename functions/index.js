import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { GoogleGenAI } from "@google/genai";

import {
  buildCommunityPrompt,
  buildPrompt,
  parseTitles,
  validateCommunityPosts,
  validatePrompt,
} from "./recommend.js";
import { searchReddit, validateRedditRequest } from "./reddit.js";

// Set once with: firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
// Reddit app credentials (reddit.com/prefs/apps, type "script" or "web app").
// Set both once with firebase functions:secrets:set; see README.
const REDDIT_CLIENT_ID = defineSecret("REDDIT_CLIENT_ID");
const REDDIT_CLIENT_SECRET = defineSecret("REDDIT_CLIENT_SECRET");

export const recommendMovies = onCall(
  {
    secrets: [GEMINI_API_KEY],
    // Caps how far a burst of traffic can scale (and spend).
    maxInstances: 2,
    concurrency: 10,
    timeoutSeconds: 30,
  },
  async (request) => {
    const prompt = validatePrompt(request.data?.prompt);
    if (!prompt) {
      throw new HttpsError(
        "invalid-argument",
        "prompt must be a non-empty string of at most 500 characters"
      );
    }

    const posts = validateCommunityPosts(request.data?.communityPosts);
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
    const ask = (contents) =>
      ai.models
        .generateContent({ model: "gemini-2.5-flash", contents, config: { maxOutputTokens: 200 } })
        .then((r) => parseTitles(r.text));

    // Community extraction is a bonus: if it fails, still return the AI picks.
    const [picks, community] = await Promise.allSettled([
      ask(buildPrompt(prompt)),
      posts.length ? ask(buildCommunityPrompt(prompt, posts)) : Promise.resolve([]),
    ]);

    if (picks.status === "rejected") {
      logger.error("Gemini request failed", picks.reason);
      throw new HttpsError("unavailable", "Recommendations are unavailable right now");
    }
    if (community.status === "rejected") logger.warn("Community extraction failed", community.reason);

    return { titles: picks.value, community: community.status === "fulfilled" ? community.value : [] };
  }
);

// Reddit blocks browser requests, so the app searches Reddit through here.
export const communitySearch = onCall(
  {
    secrets: [REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET],
    maxInstances: 2,
    concurrency: 20,
    timeoutSeconds: 15,
  },
  async (request) => {
    const query = validateRedditRequest(request.data);
    if (!query) {
      throw new HttpsError("invalid-argument", "subreddits and query are required");
    }
    const result = await searchReddit(query, {
      clientId: REDDIT_CLIENT_ID.value(),
      clientSecret: REDDIT_CLIENT_SECRET.value(),
    });
    if (result.failed === query.subreddits.length) {
      logger.warn("All Reddit searches failed", { query: query.query });
      throw new HttpsError("unavailable", "Reddit is unavailable right now");
    }
    return { posts: result.posts };
  }
);
