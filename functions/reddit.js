// Server-side Reddit search. Reddit refuses requests from browsers (CORS),
// so the web app asks this function instead.
//
// With REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET set it uses Reddit's official
// app-only OAuth API (reliable); otherwise it falls back to the public JSON.

export const ALLOWED_SUBREDDITS = [
  "MovieSuggestions", "NetflixBestOf", "televisionsuggestions", "movies",
  "flicks", "TrueFilm", "television", "TVDetails",
];
const SORTS = ["relevance", "top", "new", "comments"];
const USER_AGENT = "web:nextfilm:1.0 (DA120B student project)";
const CACHE_MS = 10 * 60 * 1000;

export function validateRedditRequest(data) {
  const allowed = new Map(ALLOWED_SUBREDDITS.map((s) => [s.toLowerCase(), s]));
  const subreddits = [
    ...new Set((Array.isArray(data?.subreddits) ? data.subreddits : [])
      .map((s) => (typeof s === "string" ? allowed.get(s.toLowerCase()) : null))
      .filter(Boolean)),
  ].slice(0, 5);
  const query = typeof data?.query === "string" ? data.query.replace(/\s+/g, " ").trim().slice(0, 200) : "";
  if (!subreddits.length || !query) return null;
  const sort = SORTS.includes(data?.sort) ? data.sort : "relevance";
  const limit = Math.min(10, Math.max(1, Number.parseInt(data?.limit, 10) || 10));
  return { subreddits, query, sort, limit };
}

export function normalizePosts(json, subreddit) {
  return (json?.data?.children || [])
    .map((c) => c?.data)
    .filter((d) => d && d.id && d.title && !d.over_18 && !d.stickied)
    .map((d) => ({
      id: d.id,
      title: String(d.title).slice(0, 300),
      subreddit: d.subreddit || subreddit,
      score: Number(d.score) || 0,
      comments: Number(d.num_comments) || 0,
      created: Number(d.created_utc) || 0,
      permalink: `https://www.reddit.com${d.permalink}`,
    }));
}

let token = null;

async function appToken(clientId, clientSecret, fetchImpl) {
  if (!clientId || !clientSecret || clientId === "none") return null;
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const res = await fetchImpl("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Reddit token ${res.status}`);
  const json = await res.json();
  token = { value: json.access_token, expires: Date.now() + (json.expires_in || 3600) * 1000 };
  return token.value;
}

const cache = new Map();

export async function searchReddit({ subreddits, query, sort, limit }, { clientId, clientSecret, fetchImpl = fetch } = {}) {
  let bearer = null;
  try {
    bearer = await appToken(clientId, clientSecret, fetchImpl);
  } catch {
    bearer = null; // fall back to the public endpoint
  }

  const one = async (sub) => {
    const params = new URLSearchParams({ q: query, restrict_sr: "1", sort, limit: String(limit), raw_json: "1" });
    const url = bearer
      ? `https://oauth.reddit.com/r/${sub}/search?${params}`
      : `https://www.reddit.com/r/${sub}/search.json?${params}`;
    const hit = cache.get(url);
    if (hit && hit.at > Date.now() - CACHE_MS) return hit.posts;
    const res = await fetchImpl(url, {
      headers: { "User-Agent": USER_AGENT, ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
    });
    if (!res.ok) throw new Error(`Reddit ${res.status}`);
    const posts = normalizePosts(await res.json(), sub);
    cache.set(url, { at: Date.now(), posts });
    return posts;
  };

  const settled = await Promise.allSettled(subreddits.map(one));
  const failed = settled.filter((s) => s.status === "rejected").length;
  return {
    posts: settled.flatMap((s) => (s.status === "fulfilled" ? s.value : [])),
    failed,
  };
}
