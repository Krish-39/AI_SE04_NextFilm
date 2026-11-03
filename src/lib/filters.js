// Browse filters: URL <-> filter state <-> TMDB /discover parameters.
// Pure functions only, so they can be unit-tested (filters.test.js).

export const MOVIE_GENRES = [
  [28, "Action"], [12, "Adventure"], [16, "Animation"], [35, "Comedy"], [80, "Crime"],
  [99, "Documentary"], [18, "Drama"], [10751, "Family"], [14, "Fantasy"], [36, "History"],
  [27, "Horror"], [10402, "Music"], [9648, "Mystery"], [10749, "Romance"], [878, "Science fiction"],
  [53, "Thriller"], [10752, "War"], [37, "Western"],
];

export const TV_GENRES = [
  [10759, "Action & adventure"], [16, "Animation"], [35, "Comedy"], [80, "Crime"], [99, "Documentary"],
  [18, "Drama"], [10751, "Family"], [10762, "Kids"], [9648, "Mystery"], [10764, "Reality"],
  [10765, "Sci-fi & fantasy"], [10766, "Soap"], [10768, "War & politics"], [37, "Western"],
];

export const RATINGS = [
  ["", "Any"], ["6", "6+"], ["7", "7+"], ["8", "8+"],
];

export const RUNTIMES = [
  ["", "Any length"], ["short", "Under 90 min"], ["medium", "90–120 min"], ["long", "Over 2 hours"],
];

const RUNTIME_RANGE = { short: [null, 89], medium: [90, 120], long: [121, null] };

export const LANGUAGES = [
  ["", "Any language"], ["en", "English"], ["de", "German"], ["fr", "French"], ["es", "Spanish"],
  ["it", "Italian"], ["ja", "Japanese"], ["ko", "Korean"], ["hi", "Hindi"], ["zh", "Chinese"],
  ["pt", "Portuguese"], ["sv", "Swedish"], ["da", "Danish"], ["tr", "Turkish"],
];

export const SORTS = [
  ["popular", "Most popular"],
  ["rating", "Highest rated"],
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["title", "Title A–Z"],
];

export const FIRST_YEAR = 1920;

const DEFAULTS = {
  type: "movie",
  genres: [],
  from: null,
  to: null,
  rating: "",
  runtime: "",
  lang: "",
  providers: [],
  sort: "popular",
};

const ids = (value) =>
  (value || "")
    .split(",")
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);

const year = (value, currentYear) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n >= FIRST_YEAR && n <= currentYear + 2 ? n : null;
};

const oneOf = (value, options, fallback) => (options.some(([v]) => v === value) ? value : fallback);

export function parseFilters(params, currentYear = new Date().getFullYear()) {
  const get = (k) => params.get(k);
  const type = get("type") === "tv" ? "tv" : "movie";
  const validGenres = new Set((type === "tv" ? TV_GENRES : MOVIE_GENRES).map(([id]) => id));
  let from = year(get("from"), currentYear);
  let to = year(get("to"), currentYear);
  if (from && to && from > to) [from, to] = [to, from];

  return {
    type,
    genres: ids(get("genres")).filter((g) => validGenres.has(g)),
    from,
    to,
    rating: oneOf(get("rating") || "", RATINGS, ""),
    runtime: type === "movie" ? oneOf(get("runtime") || "", RUNTIMES, "") : "",
    lang: oneOf(get("lang") || "", LANGUAGES, ""),
    providers: ids(get("providers")),
    sort: oneOf(get("sort") || "", SORTS, "popular"),
  };
}

// Only non-default values go in the URL, so links stay short and shareable.
export function toSearchParams(filters) {
  const f = { ...DEFAULTS, ...filters };
  const out = new URLSearchParams();
  if (f.type !== DEFAULTS.type) out.set("type", f.type);
  if (f.genres.length) out.set("genres", f.genres.join(","));
  if (f.from) out.set("from", String(f.from));
  if (f.to) out.set("to", String(f.to));
  if (f.rating) out.set("rating", f.rating);
  if (f.runtime && f.type === "movie") out.set("runtime", f.runtime);
  if (f.lang) out.set("lang", f.lang);
  if (f.providers.length) out.set("providers", f.providers.join(","));
  if (f.sort !== DEFAULTS.sort) out.set("sort", f.sort);
  return out;
}

export function activeFilterCount(f) {
  return (
    f.genres.length +
    (f.from || f.to ? 1 : 0) +
    (f.rating ? 1 : 0) +
    (f.runtime ? 1 : 0) +
    (f.lang ? 1 : 0) +
    (f.providers.length ? 1 : 0)
  );
}

export function clearFilters(f) {
  return { ...DEFAULTS, type: f.type, sort: f.sort };
}

export function toDiscoverParams(f, { region, today = new Date().toISOString().slice(0, 10) } = {}) {
  const movie = f.type === "movie";
  const dateKey = movie ? "primary_release_date" : "first_air_date";
  const p = {
    include_adult: "false",
    // Hide obscure entries with a handful of votes unless sorting by date.
    "vote_count.gte": 50,
  };

  if (movie) p.include_video = "false";
  if (f.genres.length) p.with_genres = f.genres.join(","); // comma = must match all
  if (f.from) p[`${dateKey}.gte`] = `${f.from}-01-01`;
  if (f.to) p[`${dateKey}.lte`] = `${f.to}-12-31`;
  if (f.rating) {
    p["vote_average.gte"] = f.rating;
    p["vote_count.gte"] = 200;
  }
  if (movie && f.runtime) {
    const [min, max] = RUNTIME_RANGE[f.runtime];
    if (min) p["with_runtime.gte"] = min;
    if (max) p["with_runtime.lte"] = max;
  }
  if (f.lang) p.with_original_language = f.lang;
  if (f.providers.length && region) {
    p.with_watch_providers = f.providers.join("|"); // pipe = any of these services
    p.watch_region = region;
    p.with_watch_monetization_types = "flatrate|free|ads";
  }

  switch (f.sort) {
    case "rating":
      p.sort_by = "vote_average.desc";
      p["vote_count.gte"] = Math.max(p["vote_count.gte"], 300);
      break;
    case "newest":
      p.sort_by = `${dateKey}.desc`;
      // Without an upper bound "newest" is full of unreleased placeholders.
      if (!f.to) p[`${dateKey}.lte`] = today;
      p["vote_count.gte"] = f.rating ? p["vote_count.gte"] : 10;
      break;
    case "oldest":
      p.sort_by = `${dateKey}.asc`;
      break;
    case "title":
      p.sort_by = movie ? "title.asc" : "name.asc";
      break;
    default:
      p.sort_by = "popularity.desc";
  }
  return p;
}

export function genreName(type, id) {
  return (type === "tv" ? TV_GENRES : MOVIE_GENRES).find(([g]) => g === id)?.[1] || null;
}

// Human-readable chips for the active filters, each with the filters it removes.
export function describeFilters(f, providerNames = {}) {
  const chips = [];
  for (const g of f.genres) {
    chips.push({ key: `g${g}`, label: genreName(f.type, g), next: { ...f, genres: f.genres.filter((x) => x !== g) } });
  }
  if (f.from || f.to) {
    const label = f.from && f.to ? (f.from === f.to ? `${f.from}` : `${f.from}–${f.to}`) : f.from ? `From ${f.from}` : `Up to ${f.to}`;
    chips.push({ key: "years", label, next: { ...f, from: null, to: null } });
  }
  if (f.rating) chips.push({ key: "rating", label: `Rated ${f.rating}+`, next: { ...f, rating: "" } });
  if (f.runtime) {
    chips.push({ key: "runtime", label: RUNTIMES.find(([v]) => v === f.runtime)[1], next: { ...f, runtime: "" } });
  }
  if (f.lang) chips.push({ key: "lang", label: LANGUAGES.find(([v]) => v === f.lang)[1], next: { ...f, lang: "" } });
  for (const id of f.providers) {
    chips.push({
      key: `p${id}`,
      label: providerNames[id] || "Streaming service",
      next: { ...f, providers: f.providers.filter((x) => x !== id) },
    });
  }
  return chips;
}
