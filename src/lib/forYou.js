// "For you": a small hybrid recommender over the user's watchlist.
//  - collaborative signal: TMDB "recommendations" for recently saved titles
//  - content signal: overlap with the genres the user saves most
//  - quality: TMDB rating as a tie-breaker
// Pure ranking lives here so it can be unit-tested.

const keyOf = (i) => `${i.media_type === "tv" ? "tv" : "movie"}-${i.id}`;

export function genreWeights(saved) {
  const weights = new Map();
  for (const item of saved) for (const g of item.genre_ids || []) weights.set(g, (weights.get(g) || 0) + 1);
  return weights;
}

export function topGenres(saved, n = 3) {
  return [...genreWeights(saved).entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, n)
    .map(([g]) => g);
}

export function rankForYou({ saved, recLists = [], genrePicks = [], limit = 20 }) {
  const savedKeys = new Set(saved.map(keyOf));
  const weights = genreWeights(saved);
  const maxWeight = Math.max(1, ...weights.values());
  const scores = new Map();

  const add = (item, points) => {
    if (!item?.poster_path || savedKeys.has(keyOf(item))) return;
    const k = keyOf(item);
    const entry = scores.get(k) || { item, score: 0 };
    entry.score += points;
    scores.set(k, entry);
  };

  recLists.forEach((list, listIndex) => {
    const recency = 1 - listIndex * 0.15; // newer saves count a bit more
    list.forEach((item, pos) => add(item, (3 + (20 - Math.min(pos, 20)) / 20) * recency));
  });
  genrePicks.forEach((item) => add(item, 1.5));

  for (const entry of scores.values()) {
    const genres = entry.item.genre_ids || [];
    const content = genres.reduce((sum, g) => sum + (weights.get(g) || 0), 0) / maxWeight;
    entry.score += Math.min(content, 3) + (entry.item.vote_average || 0) / 10;
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e) => e.item);
}
