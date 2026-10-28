// Reddit community signals, using Reddit's public search JSON (no key needed).
// Everything degrades quietly: if Reddit is down or rate-limits, callers get [].

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

async function searchSubreddit(subreddit, query, { limit = 10, sort = "relevance" } = {}) {
  const url =
    `https://www.reddit.com/r/${subreddit}/search.json?` +
    new URLSearchParams({ q: query, restrict_sr: "1", sort, limit: String(limit), raw_json: "1" });
  if (memory.has(url)) return memory.get(url);
  const pending = fetch(url, { headers: { Accept: "application/json" } })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Reddit ${res.status}`))))
    .then((json) => normalizePosts(json, subreddit))
    .catch(() => {
      memory.delete(url);
      return [];
    });
  memory.set(url, pending);
  return pending;
}

export async function titleDiscussions(title, kind = "movie") {
  const subs = DISCUSSION_SUBS[kind === "tv" ? "tv" : "movie"];
  const query = `"${title.replace(/"/g, "")}"`;
  const posts = rankPosts(await Promise.all(subs.map((s) => searchSubreddit(s, query, { sort: "top" }))));
  return { posts, ...buzzScore(posts) };
}

// Post titles from recommendation subreddits, for the AI to mine for picks.
export async function communityThreads(prompt) {
  const posts = rankPosts(await Promise.all(RECOMMENDATION_SUBS.map((s) => searchSubreddit(s, prompt))));
  return posts.filter((p) => p.score + p.comments >= 5);
}

export function redditSearchUrl(title) {
  return `https://www.reddit.com/search/?q=${encodeURIComponent(`"${title}"`)}`;
}
