import { api } from "../lib/api";

// The Gemini key lives only on the server (server/ai.js via /api/recommend).
// `constraints` (type, from, to, lang, rating, genres) are the search filters.
export async function getRecommendations(prompt, constraints = {}) {
  const data = await api("recommend", { q: prompt, ...constraints }, { timeout: 20000 });
  return Array.isArray(data?.titles) ? data.titles.filter((t) => typeof t === "string") : [];
}
