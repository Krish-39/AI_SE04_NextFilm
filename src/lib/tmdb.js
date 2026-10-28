const API = "https://api.themoviedb.org/3";
const IMAGES = "https://image.tmdb.org/t/p";
const KEY = import.meta.env.VITE_TMDB_API_KEY;

export const hasTmdbKey = Boolean(KEY);

const cache = new Map();

export class TmdbError extends Error {}

async function request(path, params = {}) {
  if (!KEY) {
    throw new TmdbError("Missing VITE_TMDB_API_KEY. Add it to .env and restart the dev server.");
  }
  const url = new URL(API + path);
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }
  const href = url.toString();
  if (cache.has(href)) return cache.get(href);

  const pending = fetch(href).then(async (res) => {
    if (!res.ok) throw new TmdbError(`TMDB request failed (${res.status})`);
    return res.json();
  });
  cache.set(href, pending);
  pending.catch(() => cache.delete(href));
  return pending;
}

const withKind = (items = [], kind) => items.map((item) => ({ media_type: kind, ...item }));

export const tmdb = {
  trending: (kind = "movie", window = "week") =>
    request(`/trending/${kind}/${window}`).then((d) => withKind(d.results, kind)),
  topRated: (kind = "movie") => request(`/${kind}/top_rated`).then((d) => withKind(d.results, kind)),
  byGenre: (genreId) =>
    request("/discover/movie", { with_genres: genreId, sort_by: "popularity.desc", "vote_count.gte": 200 }).then(
      (d) => withKind(d.results, "movie"),
    ),
  details: (kind, id) =>
    request(`/${kind}/${id}`, { append_to_response: "credits,videos,similar" }).then((d) => ({
      media_type: kind,
      ...d,
      similar: withKind(d.similar?.results, kind),
    })),
  search: (query) =>
    request("/search/multi", { query, include_adult: "false" }).then((d) =>
      (d.results || []).filter((r) => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path),
    ),
  findMovie: (title) =>
    request("/search/movie", { query: title, include_adult: "false" }).then(
      (d) => withKind(d.results, "movie").find((r) => r.poster_path) || null,
    ),
};

export const GENRES = {
  action: 28,
  comedy: 35,
  scifi: 878,
  horror: 27,
};

export function image(path, size = "w342") {
  return path ? `${IMAGES}/${size}${path}` : null;
}

export const titleOf = (item) => item?.title || item?.name || "Untitled";

export const yearOf = (item) => (item?.release_date || item?.first_air_date || "").slice(0, 4);

export const kindOf = (item) => (item?.media_type === "tv" ? "tv" : "movie");

export const pathOf = (item) => `/${kindOf(item)}/${item.id}`;

export const ratingOf = (item) =>
  typeof item?.vote_average === "number" && item.vote_average > 0 ? item.vote_average.toFixed(1) : null;

export function trailerOf(details) {
  const videos = details?.videos?.results || [];
  return (
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
    null
  );
}

export function runtimeOf(details) {
  const minutes = details?.runtime || details?.episode_run_time?.[0];
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

// TMDB's genre ids are stable; a static map saves a request on every load.
export const GENRE_NAMES = {
  12: "Adventure", 14: "Fantasy", 16: "Animation", 18: "Drama", 27: "Horror", 28: "Action",
  35: "Comedy", 36: "History", 37: "Western", 53: "Thriller", 80: "Crime", 99: "Documentary",
  878: "Science fiction", 9648: "Mystery", 10402: "Music", 10749: "Romance", 10751: "Family",
  10752: "War", 10759: "Action & adventure", 10762: "Kids", 10764: "Reality",
  10765: "Sci-fi & fantasy", 10766: "Soap", 10768: "War & politics", 10770: "TV movie",
};
