import { getFunctions, httpsCallable } from "firebase/functions";

import { app } from "../firebase";

// The Gemini key lives only in the `recommendMovies` Cloud Function
// (functions/index.js). The browser never sees it.
const recommendMovies = httpsCallable(getFunctions(app), "recommendMovies");

export async function getMovieRecommendations(userPrompt) {
  try {
    const result = await recommendMovies({ prompt: userPrompt });
    return Array.isArray(result.data?.titles) ? result.data.titles : [];
  } catch (error) {
    console.error("Recommendation error:", error);
    return [];
  }
}
