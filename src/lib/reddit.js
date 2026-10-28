// Reddit community signals.
//
// Reddit refuses requests made directly from browsers (CORS), so:
//  - in development (`npm run dev`) requests go through Vite's /reddit-api proxy
//  - in production they go through the `communitySearch` Cloud Function
// Everything degrades quietly: if Reddit is down or rate-limits, callers get [].

import { app } from "../firebase";

const RECOMMENDATION_SUBS = ["MovieSuggestions", "NetflixBestOf", "televisionsuggestions", "movies"];
const DISCUSSION_SUBS = { movie: ["movies", "flicks", "TrueFilm"], tv: ["television", "TVDetails", "televisionsuggestions"] };

const memory = new Map();

export function normalizePosts(json, subreddit) {
  return (json?.data?.children || [])
    .map((c) => c?.data)
    .filter((d) => d && d.id && d.title && !d.over_18 && !d.stickied)
    .map((d) => ({
      id: d.id,
      title: d.title,
      subreddit: d.subreddit || subreddit,
      score: Number(d.score) || 0,
      comments: Number(d.num_comments) || 0,
      created: Number(d.created_utc) || 0,
      permalink: `https://www.reddit.com${d.permalink}`,
    }));
}

// Merge posts from several subreddits: drop duplicates, most engaged first.
export function rankPosts(lists, limit = 15) {
  const byId = new Map();
  for (const post of lists.flat()) if (!byId.has(post.id)) byId.set(post.id, post);
  return [...byId.values()].sort((a, b) => b.score + b.comments - (a.score + a.comments)).slice(0, limit);
}

// 0–100 "buzz" score: total engagement on the matching threads, log-scaled so
// a few viral posts don't pin every popular title at 100.
export function buzzScore(posts) {
  if (!posts.length) return { score: 0, discussions: 0, engagement: 0 };
  const engagement = posts.reduce((sum, p) => sum + p.score + p.comments, 0);
  const score = Math.min(100, Math.round(Math.log10(engagement + 1) * 22));
  return { score, discussions: posts.length, engagement };
}

let callable;

async function viaFunction(subreddits, query, opts) {
  if (!callable) {
    const { getFunctions, httpsCallable } = await import("firebase/functions");
    callable = httpsCallable(getFunctions(app), "communitySearch");
  }
  const { data } = await callable({ subreddits, query, ...opts });
  return Array.isArray(data?.posts) ? data.posts : [];
}

async function viaDevProxy(subreddits, query, { limit, sort }) {
  const lists = await Promise.all(
    subreddits.map((sub) =>
      fetch(
        `/reddit-api/r/${sub}/search.json?` +
          new URLSearchParams({ q: query, restrict_sr: "1", sort, limit: String(limit), raw_json: "1" }),
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Reddit ${res.status}`))))
        .then((json) => normalizePosts(json, sub))
        .catch(() => []),
    ),
  );
  return lists.flat();
}

// Search several subreddits at once. Results are cached for the session.
async function searchSubreddits(subreddits, query, { limit = 10, sort = "relevance" } = {}) {
  const key = JSON.stringify([subreddits, query, limit, sort]);
  if (memory.has(key)) return memory.get(key);
  const pending = (import.meta.env.DEV ? viaDevProxy : viaFunction)(subreddits, query, { limit, sort }).catch(() => {
    memory.delete(key);
    return [];
  });
  memory.set(key, pending);
  return pending;
}

export async function titleDiscussions(title, kind = "movie") {
  const subs = DISCUSSION_SUBS[kind === "tv" ? "tv" : "movie"];
  const query = `"${title.replace(/"/g, "")}"`;
  const posts = rankPosts([await searchSubreddits(subs, query, { sort: "top" })]);
  return { posts, ...buzzScore(posts) };
}

// Post titles from recommendation subreddits, for the AI to mine for picks.
export async function communityThreads(prompt) {
  const posts = rankPosts([await searchSubreddits(RECOMMENDATION_SUBS, prompt)]);
  return posts.filter((p) => p.score + p.comments >= 5);
}

export function redditSearchUrl(title) {
  return `https://www.reddit.com/search/?q=${encodeURIComponent(`"${title}"`)}`;
}
