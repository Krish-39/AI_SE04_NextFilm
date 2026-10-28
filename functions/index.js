import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { GoogleGenAI } from "@google/genai";

import { buildPrompt, parseTitles, validatePrompt } from "./recommend.js";

// Set once with: firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

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

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildPrompt(prompt),
        config: { maxOutputTokens: 200 },
      });

      return { titles: parseTitles(response.text) };
    } catch (error) {
      logger.error("Gemini request failed", error);
      throw new HttpsError("unavailable", "Recommendations are unavailable right now");
    }
  }
);
