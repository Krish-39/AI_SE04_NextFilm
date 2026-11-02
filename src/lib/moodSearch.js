// Understands a plain-English request ("a sad space movie from the 90s") without
// AI: moods and topics become TMDB genres, eras become years, languages become
// original-language filters, "like <title>" becomes a reference title, and the
// remaining words are looked up as TMDB keywords. It also decides whether the
// text is a film or TV request at all ("chicken masala" is not).
// Pure parsing lives in parseRequest (tested in moodSearch.test.js).

import { TV_EQUIVALENT } from "./searchFilters";

// [words, movie genre, tv genre, also search it as a keyword]
const TOPICS = [
  [["sad", "sadder", "saddest", "emotional", "tearjerker", "cry", "crying", "heartbreaking", "melancholy", "depressing", "moving", "touching", "drama", "dramatic"], 18, 18],
  [["funny", "comedy", "comedies", "hilarious", "laugh", "lighthearted", "light-hearted", "silly", "goofy", "feel-good", "feelgood", "witty", "funnier", "funniest", "cozy", "cosy", "cozier", "cosier", "wholesome", "heartwarming", "heart-warming", "uplifting", "comfort", "comforting"], 35, 35],
  [["scary", "scarier", "scariest", "horror", "creepy", "terrifying", "frightening", "spooky", "haunted", "slasher"], 27, null],
  [["thriller", "suspense", "suspenseful", "tense", "gripping", "twist", "twists", "psychological"], 53, 9648],
  [["action", "explosive", "fights", "fighting", "martial"], 28, 10759],
  [["adventure", "quest", "journey", "epic", "treasure"], 12, 10759],
  [["romantic", "romance", "love", "romcom", "rom-com", "date"], 10749, null],
  [["animated", "animation", "cartoon", "pixar", "anime"], 16, 16],
  [["space", "sci-fi", "scifi", "alien", "aliens", "futuristic", "future", "robot", "robots", "dystopian", "dystopia", "cyberpunk", "astronaut", "planet"], 878, 10765, true],
  [["fantasy", "magic", "magical", "dragon", "dragons", "wizard", "wizards", "fairy"], 14, 10765, true],
  [["crime", "heist", "gangster", "gangsters", "mafia", "mob", "detective", "cop", "cops", "murder", "serial", "killer"], 80, 80, true],
  [["mystery", "whodunit", "mysterious", "puzzle"], 9648, 9648],
  [["documentary", "documentaries", "docuseries"], 99, 99],
  [["family", "kids", "kid", "children", "kid-friendly", "family-friendly", "mom", "mum", "dad", "parents", "grandma", "grandparents"], 10751, 10751],
  [["war", "soldier", "soldiers", "military", "ww2", "wwii"], 10752, 10768, true],
  [["western", "cowboy", "cowboys"], 37, 37],
  [["musical", "music", "band", "singer"], 10402, null],
  [["history", "historical", "period"], 36, null],
];

const LANGS = {
  korean: "ko", "k-drama": "ko", kdrama: "ko", japanese: "ja", anime: "ja", french: "fr", spanish: "es",
  german: "de", italian: "it", hindi: "hi", bollywood: "hi", indian: "hi", chinese: "zh", swedish: "sv",
  danish: "da", turkish: "tr", portuguese: "pt", brazilian: "pt",
};

const SERIES_WORDS = new Set(["series", "show", "shows", "tv", "sitcom", "sitcoms", "miniseries", "season", "seasons", "binge", "k-drama", "kdrama", "docuseries"]);
const MOVIE_WORDS = new Set(["movie", "movies", "film", "films", "flick", "flicks"]);
// Words that only make sense when asking for something to watch.
const INTENT_WORDS = new Set(["watch", "watching", "binge", "binge-watch", "stream", "streaming", "rewatch", "recommendation", "recommendations", "recommend", "suggest", "suggestions", "plot", "cast", "actor", "actress", "director", "directed", "starring", "sequel", "trilogy", "franchise", "episode", "episodes", "cinema", "cinematic", "netflix", "hbo", "prime", "disney", "oscar", "oscars"]);
const QUALITY_WORDS = new Set(["best", "great", "good", "acclaimed", "masterpiece", "masterpieces", "classic", "top", "underrated", "highly", "rated"]);

const STOP = new Set(
  ("a an the and or but of in on at to for from with without about into like as is are was be been i me my we you something "
    + "some any want looking look find recommend recommendation recommendations suggest suggestions need watch watching tonight "
    + "night that which who where when what kind type sort really very bit little lot more most less mood feel feeling "
    + "set based where there it its this these those one ones please can could would should get got old new recent").split(" "),
);

const words = (q) => q.toLowerCase().replace(/[^\p{L}\p{N}'\- ]+/gu, " ").split(/\s+/).filter(Boolean);

function era(q, currentYear) {
  const text = q.toLowerCase();
  const decade = text.match(/\b(?:(19|20)?(\d)0)['’]?s\b/);
  if (decade) {
    const century = decade[1] || (Number(decade[2]) <= 2 ? "20" : "19");
    const from = Number(`${century}${decade[2]}0`);
    return { from, to: Math.min(from + 9, currentYear) };
  }
  const span = text.match(/\b((?:19|20)\d{2})\s*(?:-|–|to|until)\s*((?:19|20)\d{2})\b/);
  if (span) return { from: Number(span[1]), to: Number(span[2]) };
  const after = text.match(/\b(?:after|since)\s+((?:19|20)\d{2})\b/);
  if (after) return { from: Number(after[1]), to: null };
  const before = text.match(/\bbefore\s+((?:19|20)\d{2})\b/);
  if (before) return { from: null, to: Number(before[1]) - 1 };
  const single = text.match(/\b(?:from|in)\s+((?:19|20)\d{2})\b/);
  if (single) return { from: Number(single[1]), to: Number(single[1]) };
  if (/\b(old|classic|classics|vintage|black and white)\b/.test(text)) return { from: null, to: 1985 };
  if (/\b(recent|new|newer|latest|modern)\b/.test(text)) return { from: currentYear - 4, to: null };
  return { from: null, to: null };
}

// "something like Arrival but cosier" -> "Arrival"
export function referenceOf(q) {
  const m = q.match(/\b(?:like|similar to|in the style of|such as|as good as|same vibe as|reminds me of)\s+(.+?)(?=\s+(?:but|with|and|from|in the|set in|except|only)\b|[,.;!?]|$)/i);
  if (!m) return null;
  const ref = m[1].replace(/^(?:the (?:movie|film|show|series)|movies?|films?|shows?)\s+/i, "").replace(/["“”]/g, "").trim();
  return ref && ref.split(/\s+/).length <= 7 ? ref : null;
}

export function parseRequest(q, currentYear = new Date().getFullYear()) {
  const reference = referenceOf(q);
  const refWords = new Set(reference ? words(reference) : []);
  const list = words(q).filter((w) => !refWords.has(w));
  const all = words(q);
  const saysSeries = all.some((w) => SERIES_WORDS.has(w));
  const saysMovie = all.some((w) => MOVIE_WORDS.has(w));
  const type = saysSeries && !saysMovie ? "tv" : "movie";
  const genres = new Set();
  const topics = []; // [movie genre, tv genre] pairs, so filters can switch type later
  const keywords = [];
  const used = new Set();

  for (const [topicWords, movieGenre, tvGenre, alsoKeyword] of TOPICS) {
    for (const w of list) {
      if (!topicWords.includes(w)) continue;
      const g = type === "tv" ? tvGenre : movieGenre;
      if (g) genres.add(g);
      else if (!keywords.includes(w)) keywords.push(w); // e.g. "horror" for series has no TV genre
      if (!topics.some(([m, t]) => m === movieGenre && t === tvGenre)) topics.push([movieGenre, tvGenre]);
      if (alsoKeyword && !keywords.includes(w)) keywords.push(w);
      used.add(w);
    }
  }

  let lang = "";
  for (const w of list) {
    if (LANGS[w]) {
      lang = LANGS[w];
      used.add(w);
      if (w === "anime") genres.add(16);
    }
  }

  const { from, to } = era(q, currentYear);
  const rating = list.some((w) => QUALITY_WORDS.has(w)) ? "7" : "";
  const runtime = type === "movie" && /\b(short|quick|under 90)\b/.test(q.toLowerCase()) ? "short" : "";

  for (const w of list) {
    if (used.has(w) || STOP.has(w) || SERIES_WORDS.has(w) || MOVIE_WORDS.has(w) || QUALITY_WORDS.has(w) || INTENT_WORDS.has(w)) continue;
    if (/^\d+'?s?$/.test(w) || w.length < 3) continue;
    if (!keywords.includes(w)) keywords.push(w);
  }

  // Signals that the text asks for something to watch. Keywords alone don't
  // count: "chicken masala" has TMDB keywords too.
  const signals = {
    topic: topics.length > 0,
    medium: saysSeries || saysMovie,
    intent: all.some((w) => INTENT_WORDS.has(w)),
    era: Boolean(from || to),
    lang: Boolean(lang),
    quality: Boolean(rating),
    reference: Boolean(reference),
  };

  return {
    type,
    typeExplicit: saysSeries !== saysMovie,
    genres: [...genres],
    topics,
    from,
    to,
    lang,
    rating,
    runtime,
    keywords: keywords.slice(0, 4),
    reference,
    signals,
  };
}

// Is this a request for films or series? A reference title only counts once
// TMDB confirms it exists (pass referenceFound).
export function isFilmRequest(parsed, referenceFound = false) {
  const { topic, medium, intent, era, lang, quality } = parsed.signals;
  return Boolean(topic || medium || intent || era || lang || quality || referenceFound);
}

// The parsed request with the user's sidebar filters applied on top: filters
// win for type, years and language; genres add up; the higher rating wins.
export function withFilters(parsed, filters = {}) {
  const type = filters.type === "movie" || filters.type === "tv" ? filters.type : parsed.type;
  const fromText = parsed.topics.map(([m, t]) => (type === "tv" ? t : m)).filter(Boolean);
  const fromFilters = (filters.genres || []).flatMap((g) => (type === "tv" ? TV_EQUIVALENT[g] ?? [g] : [g]));
  const genres = [...new Set([...fromText, ...fromFilters])];
  const rating = String(Math.max(Number(parsed.rating || 0), Number(filters.rating || 0)) || "");
  return {
    ...parsed,
    type,
    genres,
    from: filters.from ?? parsed.from,
    to: filters.to ?? parsed.to,
    lang: filters.lang || parsed.lang,
    rating: rating === "0" ? "" : rating,
    runtime: type === "movie" ? parsed.runtime : "",
  };
}

// Turn the parsed request into TMDB /discover attempts, strictest first:
// all genres + keywords, then all genres, then any of the genres.
export function discoverAttempts(parsed, keywordIds) {
  const base = { include_adult: "false", sort_by: "popularity.desc", "vote_count.gte": parsed.rating ? 300 : 80 };
  const date = parsed.type === "tv" ? "first_air_date" : "primary_release_date";
  if (parsed.from) base[`${date}.gte`] = `${parsed.from}-01-01`;
  if (parsed.to) base[`${date}.lte`] = `${parsed.to}-12-31`;
  if (parsed.lang) base.with_original_language = parsed.lang;
  if (parsed.rating) base["vote_average.gte"] = parsed.rating;
  if (parsed.runtime === "short") base["with_runtime.lte"] = 89;

  const attempts = [];
  const all = parsed.genres.join(",");
  if (keywordIds.length) attempts.push({ ...base, with_keywords: keywordIds.join("|"), ...(all && { with_genres: all }) });
  if (all) attempts.push({ ...base, with_genres: all });
  if (parsed.genres.length > 1) attempts.push({ ...base, with_genres: parsed.genres.join("|") });
  if (!attempts.length) attempts.push(base);
  return attempts;
}

// TMDB /discover results for a (filtered) request. Keyword ids come from the
// leftover words; a keyword must match a TMDB keyword exactly.
export async function discoverFor(spec, { tmdb }) {
  const ids = (await Promise.all(spec.keywords.map((k) => tmdb.keyword(k).catch(() => null)))).filter(Boolean);
  let best = [];
  for (const params of discoverAttempts(spec, ids)) {
    const { results } = await tmdb.discover(spec.type, params, 1);
    if (results.length > best.length) best = results;
    if (results.length >= 8) break;
  }
  return best;
}
