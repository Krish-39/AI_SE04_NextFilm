import { app } from "../firebase";

// The Gemini key lives only in the `recommendMovies` Cloud Function
// (functions/index.js). The browser never sees it.
let callable;

export async function getRecommendations(prompt, communityPosts = []) {
  if (!callable) {
    const { getFunctions, httpsCallable } = await import("firebase/functions");
    callable = httpsCallable(getFunctions(app), "recommendMovies");
  }
  const { data } = await callable({ prompt, communityPosts });
  const list = (v) => (Array.isArray(v) ? v.filter((t) => typeof t === "string") : []);
  return { titles: list(data?.titles), community: list(data?.community) };
}
