// Reddit community signals.
//
// Reddit refuses requests made directly from browsers (CORS), so everything
// goes through the site's own /api functions (server/handlers.js).
// Everything degrades quietly: if Reddit is down or rate-limits, callers get [].

import { api } from "./api";

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

// Search several subreddits at once. Results are cached for the session.
async function searchSubreddits(subreddits, query, { limit = 10, sort = "relevance" } = {}) {
  const key = JSON.stringify([subreddits, query, limit, sort]);
  if (memory.has(key)) return memory.get(key);
  const pending = api("community", { subs: subreddits.join(","), q: query, sort, limit: String(limit) })
    .then((d) => (Array.isArray(d?.posts) ? d.posts : []))
    .catch(() => {
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

// Titles real people recommend in reply to threads like this request,
// counted across the most upvoted comments (server/picks.js).
export async function communityPicks(prompt, kind = "movie") {
  return api("reddit-picks", { q: prompt, kind: kind === "tv" ? "tv" : "movie" }, { timeout: 20000 });
}

export function redditSearchUrl(title) {
  return `https://www.reddit.com/search/?q=${encodeURIComponent(`"${title}"`)}`;
}
