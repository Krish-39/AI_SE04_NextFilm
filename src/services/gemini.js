import { api } from "../lib/api";

// The Gemini key lives only on the server (server/ai.js via /api/recommend).
export async function getRecommendations(prompt) {
  const data = await api("recommend", { q: prompt }, { timeout: 20000 });
  return Array.isArray(data?.titles) ? data.titles.filter((t) => typeof t === "string") : [];
}
