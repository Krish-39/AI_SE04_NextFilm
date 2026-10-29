// Combine AI picks with community (Reddit) picks: AI order first, no duplicates,
// and anything the community also named gets the `fromReddit` flag.
export function mergePicks(aiPicks, communityPicks) {
  const key = (i) => `${i.media_type === "tv" ? "tv" : "movie"}-${i.id}`;
  const out = new Map();
  for (const item of aiPicks) if (item && !out.has(key(item))) out.set(key(item), { ...item });
  for (const item of communityPicks) {
    if (!item) continue;
    const k = key(item);
    out.set(k, { ...(out.get(k) || item), fromReddit: true });
  }
  return [...out.values()];
}

export const withTimeout = (promise, ms, fallback) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);
