// Filters for the search page. Search results come from several places (TMDB
// title search, the mood search, AI and Reddit picks), so they are filtered in
// the browser using the fields every result has.
import { LANGUAGES, MOVIE_GENRES, RATINGS } from "./filters";

export const SEARCH_SORTS = [
  ["best", "Best match"],
  ["popular", "Most popular"],
  ["rating", "Highest rated"],
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["title", "Title A–Z"],
];

// Film genre -> the matching TV genre ids, so one genre list covers both.
const TV_EQUIVALENT = {
  28: [10759], 12: [10759], 878: [10765], 14: [10765], 10752: [10768], 27: [], 53: [9648], 10749: [], 36: [], 10402: [],
};

const DEFAULTS = { type: "all", genres: [], from: null, to: null, rating: "", lang: "", sort: "best" };

const yearOf = (item) => Number.parseInt((item.release_date || item.first_air_date || "").slice(0, 4), 10) || null;

export function parseSearchFilters(params, currentYear = new Date().getFullYear()) {
  const valid = new Set(MOVIE_GENRES.map(([id]) => id));
  const year = (v) => {
    const n = Number.parseInt(v, 10);
    return Number.isInteger(n) && n >= 1900 && n <= currentYear + 2 ? n : null;
  };
  let from = year(params.get("from"));
  let to = year(params.get("to"));
  if (from && to && from > to) [from, to] = [to, from];
  const pick = (v, list, fallback) => (list.some(([x]) => x === v) ? v : fallback);
  return {
    type: ["movie", "tv"].includes(params.get("type")) ? params.get("type") : "all",
    genres: (params.get("genres") || "").split(",").map(Number).filter((g) => valid.has(g)),
    from,
    to,
    rating: pick(params.get("rating") || "", RATINGS, ""),
    lang: pick(params.get("lang") || "", LANGUAGES, ""),
    sort: pick(params.get("sort") || "", SEARCH_SORTS, "best"),
  };
}

// Writes filters into an existing URLSearchParams (keeps q and ai).
export function writeSearchFilters(base, f) {
  const out = new URLSearchParams(base);
  for (const k of ["type", "genres", "from", "to", "rating", "lang", "sort"]) out.delete(k);
  if (f.type !== DEFAULTS.type) out.set("type", f.type);
  if (f.genres.length) out.set("genres", f.genres.join(","));
  if (f.from) out.set("from", String(f.from));
  if (f.to) out.set("to", String(f.to));
  if (f.rating) out.set("rating", f.rating);
  if (f.lang) out.set("lang", f.lang);
  if (f.sort !== DEFAULTS.sort) out.set("sort", f.sort);
  return out;
}

export const clearSearchFilters = (f) => ({ ...DEFAULTS, type: f.type, sort: f.sort });

export const searchFilterCount = (f) =>
  f.genres.length + (f.from || f.to ? 1 : 0) + (f.rating ? 1 : 0) + (f.lang ? 1 : 0);

function hasGenre(item, genre) {
  const ids = item.genre_ids || item.genres?.map((g) => g.id) || [];
  if (ids.includes(genre)) return true;
  return item.media_type === "tv" && (TV_EQUIVALENT[genre] || []).some((g) => ids.includes(g));
}

export function matchesSearchFilters(item, f) {
  const kind = item.media_type === "tv" ? "tv" : "movie";
  if (f.type !== "all" && kind !== f.type) return false;
  if (!f.genres.every((g) => hasGenre(item, g))) return false;
  const y = yearOf(item);
  if ((f.from || f.to) && !y) return false;
  if (f.from && y < f.from) return false;
  if (f.to && y > f.to) return false;
  if (f.rating && !((item.vote_average || 0) >= Number(f.rating))) return false;
  if (f.lang && item.original_language !== f.lang) return false;
  return true;
}

const SORTERS = {
  popular: (a, b) => (b.popularity || 0) - (a.popularity || 0),
  rating: (a, b) => (b.vote_average || 0) - (a.vote_average || 0) || (b.vote_count || 0) - (a.vote_count || 0),
  newest: (a, b) => (yearOf(b) || 0) - (yearOf(a) || 0),
  oldest: (a, b) => (yearOf(a) || 9999) - (yearOf(b) || 9999),
  title: (a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""),
};

export function applySearchFilters(items, f) {
  const kept = items.filter((i) => matchesSearchFilters(i, f));
  return f.sort === "best" ? kept : [...kept].sort(SORTERS[f.sort]);
}

export function describeSearchFilters(f) {
  const chips = [];
  for (const g of f.genres) {
    chips.push({ key: `g${g}`, label: MOVIE_GENRES.find(([id]) => id === g)[1], next: { ...f, genres: f.genres.filter((x) => x !== g) } });
  }
  if (f.from || f.to) {
    const label = f.from && f.to ? (f.from === f.to ? `${f.from}` : `${f.from}–${f.to}`) : f.from ? `From ${f.from}` : `Up to ${f.to}`;
    chips.push({ key: "years", label, next: { ...f, from: null, to: null } });
  }
  if (f.rating) chips.push({ key: "rating", label: `Rated ${f.rating}+`, next: { ...f, rating: "" } });
  if (f.lang) chips.push({ key: "lang", label: LANGUAGES.find(([v]) => v === f.lang)[1], next: { ...f, lang: "" } });
  return chips;
}
