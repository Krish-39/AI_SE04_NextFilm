// The clerk's pipeline for "describe what you want" searches:
//
//   1. understand  - parse the text; look up a "like <title>" reference;
//                    decide: a film request, an exact title, or not a film thing
//   2. gather      - TMDB discover (with the user's filters merged in),
//                    titles similar to the reference, AI picks, Reddit picks
//   3. rank        - one score per title: how many sources agree, how well the
//                    genres fit, then rating; weak or obscure entries are dropped
//   4. filter      - the user's filters are applied again to every source,
//                    so nothing outside them can slip through
import { discoverFor, isFilmRequest, parseRequest, withFilters } from "./moodSearch";
import { applySearchFilters } from "./searchFilters";

const key = (i) => `${i.media_type === "tv" ? "tv" : "movie"}-${i.id}`;
const MIN_VOTES = 20;

const norm = (s) => (s || "").toLowerCase().replace(/^the\s+/, "").replace(/[^\p{L}\p{N}]+/gu, "");

// `aiCheck` (optional) is a second opinion for wording the rules don't know:
// it returns AI picks for the text, or [] when the AI says it isn't a film
// request (the server prompt tells it to answer NONE for food and the like).
export async function understand(q, { tmdb, aiCheck }) {
  const parsed = parseRequest(q);
  let reference = null;
  if (parsed.reference) {
    const hit = await tmdb.findTitle(parsed.reference).catch(() => null);
    // Only well-known titles count as a reference.
    if (hit && (hit.vote_count || 0) >= 50) reference = hit;
  }
  if (isFilmRequest(parsed, Boolean(reference))) return { kind: "film", parsed, reference };
  // "the lord of the rings" has no mood words but is a real title.
  const exact = await tmdb.matchTitle(q).catch(() => null);
  if (exact) return { kind: "title", parsed, reference: null };
  if (aiCheck) {
    const picks = await aiCheck(q).catch(() => []);
    if (picks.length >= 2) return { kind: "film", parsed, reference: null, byAi: true };
  }
  return { kind: "none", parsed, reference: null };
}

// What the AI should respect, in a fixed shape the server turns into words.
export function constraintsFor(spec, filters) {
  const c = {};
  if (filters.type === "movie" || filters.type === "tv") c.type = filters.type;
  else if (spec.typeExplicit) c.type = spec.type;
  if (spec.from) c.from = String(spec.from);
  if (spec.to) c.to = String(spec.to);
  if (spec.lang) c.lang = spec.lang;
  if (spec.rating) c.rating = spec.rating;
  if (filters.genres?.length) c.genres = filters.genres.join(",");
  return c;
}

export async function gather(u, filters, { tmdb }) {
  const spec = withFilters(u.parsed, filters);
  const hasShape = spec.genres.length || spec.keywords.length || spec.lang || spec.from || spec.to || spec.rating;
  const ref = u.reference;
  const [discover, similar] = await Promise.all([
    // Nothing to search by (the AI understood it, the rules didn't): don't
    // pad the list with generic popular titles.
    hasShape ? discoverFor(spec, { tmdb }) : [],
    ref ? tmdb.recommendations(ref.media_type === "tv" ? "tv" : "movie", ref.id).catch(() => []) : [],
  ]);
  return { spec, discover, similar };
}

// Merge every source into one ranked list.
export function rank({ ai = [], similar = [], discover = [] }, { spec, reference, filters, exclude = new Set() }) {
  const byKey = new Map();
  const add = (items, source) => {
    items.forEach((item, position) => {
      if (!item) return;
      const k = key(item);
      if (exclude.has(k) || (reference && k === key(reference))) return;
      const entry = byKey.get(k) || { ...item, sources: new Set(), firstSeen: Infinity };
      entry.sources.add(source);
      entry.firstSeen = Math.min(entry.firstSeen, position);
      byKey.set(k, entry);
    });
  };
  add(ai, "ai");
  add(similar, "similar");
  add(discover, "discover");

  const wanted = new Set(spec.genres);
  const scored = [...byKey.values()]
    .filter((i) => (i.vote_count || 0) >= MIN_VOTES)
    .map((i) => {
      const ids = i.genre_ids || [];
      const fit = wanted.size ? ids.filter((g) => wanted.has(g)).length / wanted.size : 0;
      const score =
        (i.sources.has("ai") ? 3 : 0) +
        (i.sources.has("similar") ? 2.5 : 0) +
        (i.sources.has("discover") ? 2 : 0) +
        fit * 2 +
        (i.vote_average || 0) / 5 +
        Math.log10((i.vote_count || 0) + 1) / 4 -
        i.firstSeen * 0.05;
      return { ...i, sources: [...i.sources], score };
    })
    .sort((a, b) => b.score - a.score);

  return applySearchFilters(scored, filters);
}

// Exact-ish title results only: drop near-empty TMDB entries unless the
// title is exactly what was typed.
export function cleanTitleResults(items, q) {
  const want = norm(q);
  return items.filter((i) => (i.vote_count || 0) >= 3 || norm(i.title || i.name) === want);
}
