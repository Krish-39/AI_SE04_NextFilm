// HTTP handlers shared by the Vercel functions in /api and the Vite dev
// server, so `npm run dev` behaves like production.
import { extractTitlesWithAi, recommend } from "./ai.js";
import { communityPicks, validatePicksRequest } from "./picks.js";
import { redditRequestFromParams, searchReddit } from "./reddit.js";
import { validateConstraints, validatePrompt } from "./recommend.js";

const env = (name) => {
  const v = process.env[name];
  return v && v !== "none" ? v : null;
};
const redditAuth = () => ({ clientId: env("REDDIT_CLIENT_ID"), clientSecret: env("REDDIT_CLIENT_SECRET") });

function send(res, status, body, cacheSeconds = 0) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (cacheSeconds) res.setHeader("Cache-Control", `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`);
  res.end(JSON.stringify(body));
}

const paramsOf = (req) => new URL(req.url, "http://localhost").searchParams;

function wrap(fn) {
  return async (req, res) => {
    if (req.method !== "GET") return send(res, 405, { error: "GET only" });
    try {
      await fn(paramsOf(req), res);
    } catch (error) {
      console.error(error);
      send(res, 503, { error: "unavailable" });
    }
  };
}

export const community = wrap(async (params, res) => {
  const query = redditRequestFromParams(params);
  if (!query) return send(res, 400, { error: "subs and q are required" });
  const result = await searchReddit(query, redditAuth());
  if (result.failed === query.subreddits.length) return send(res, 503, { error: "reddit unavailable" });
  send(res, 200, { posts: result.posts }, 600);
});

export const redditPicks = wrap(async (params, res) => {
  const request = validatePicksRequest(params);
  if (!request) return send(res, 400, { error: "q is required" });
  const key = env("GEMINI_API_KEY");
  const result = await communityPicks(request, {
    ...redditAuth(),
    extractWithAi: key ? (comments) => extractTitlesWithAi(comments, key) : null,
  });
  send(res, 200, result, 600);
});

export const recommendTitles = wrap(async (params, res) => {
  const prompt = validatePrompt(params.get("q"));
  if (!prompt) return send(res, 400, { error: "q must be 1-500 characters" });
  const key = env("GEMINI_API_KEY");
  if (!key) return send(res, 501, { error: "AI not configured" });
  send(res, 200, { titles: await recommend(prompt, key, validateConstraints(params)) }, 3600);
});

export const routes = { community, "reddit-picks": redditPicks, recommend: recommendTitles };
