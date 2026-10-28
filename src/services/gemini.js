// The Gemini key lives only in the `recommendMovies` Cloud Function
// (functions/index.js). The browser never sees it.
import { app } from "../firebase";

let callable;

export async function getMovieRecommendations(userPrompt) {
  if (!callable) {
    const { getFunctions, httpsCallable } = await import("firebase/functions");
    callable = httpsCallable(getFunctions(app), "recommendMovies");
  }
  const result = await callable({ prompt: userPrompt });
  return Array.isArray(result.data?.titles) ? result.data.titles : [];
}
