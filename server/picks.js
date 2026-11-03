// "What Reddit recommends": find recommendation threads that match the
// request, read their most upvoted replies and count which titles people name.
// Votes come from real users, so a title many people upvoted ranks first.

import { redditGet, searchReddit } from "./reddit.js";

const SUBS = {
  movie: ["MovieSuggestions", "NetflixBestOf", "movies"],
  tv: ["televisionsuggestions", "NetflixBestOf", "television"],
};
const MAX_THREADS = 4;
const COMMENTS_PER_THREAD = 30;
const MAX_PICKS = 12;

// Words that start a sentence, not a title.
const NOT_TITLES = new Set(
  "i,i'm,im,you,your,this,that,it,it's,its,if,yes,no,yeah,thanks,thank you,edit,also,and,but,so,maybe,try,watch,check,definitely,honestly,seconding,second,same,agreed,lol,op,the movie,the show,this one,that one,deleted,removed"
    .split(","),
);

const clean = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // markdown links
    .replace(/[*_~`>#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const LEAD_IN =
  /^(?:(?:try|watch|check out|maybe|definitely|also|and|or|how about|i'd recommend|i recommend|i'd suggest|i suggest|you might like|you should watch|seconding|second|go with|recommend|easily|obviously|honestly)\s+)+/i;
const SMALL = new Set(["of", "the", "a", "an", "and", "in", "on", "to", "for", "at", "with", "from", "by", "is", "my", "me", "your", "it", "or", "vs", "de", "la", "le"]);

// Most words capitalised, like a title ("Eternal Sunshine of the Spotless Mind"),
// not a sentence ("Moon is perfect for this").
function looksLikeTitle(text) {
  const ws = text.split(" ");
  const big = ws.filter((w) => /^[\p{Lu}\d]/u.test(w)).length;
  const small = ws.filter((w) => SMALL.has(w.toLowerCase()) && !/^[\p{Lu}\d]/u.test(w)).length;
  return /^[\p{Lu}\d]/u.test(ws[0]) && big + small === ws.length && big >= Math.ceil(ws.length / 2);
}

function candidate(raw, { strict }) {
  let text = clean(raw);
  const year = text.match(/\((19\d{2}|20\d{2})\)/)?.[1] || null;
  text = text
    .replace(/\s*\((19\d{2}|20\d{2})\).*$/, "")
    .split(/\s[-–—:|]\s|[.!?;](\s|$)/)[0]
    .replace(LEAD_IN, "")
    .replace(/^["“'‘]+|["”'’,;!?.]+$/g, "")
    .trim();
  if (text.length < 2 || text.length > 60) return null;
  if (!/^[\p{Lu}\d]/u.test(text)) return null;
  if (NOT_TITLES.has(text.toLowerCase())) return null;
  if (text.split(" ").length > 8) return null;
  if (strict && !looksLikeTitle(text)) return null;
  return { title: text, year: year ? Number(year) : null };
}

// Pull likely titles from one comment without an AI. Bold or italic text is
// trusted first; otherwise "Title (2009)" patterns and short title-case lines.
export function extractTitles(body) {
  if (typeof body !== "string") return [];
  const emphasised = [];
  for (const m of body.matchAll(/\*\*([^*\n]{2,80})\*\*|(?<![*\w])\*([^*\n]{2,80})\*(?!\*)|(?<!\w)_([^_\n]{2,80})_(?!\w)/g)) {
    emphasised.push(m[1] || m[2] || m[3]);
  }
  const loose = [];
  if (!emphasised.length) {
    for (const m of body.matchAll(/([^\n(),.;!?]{1,60}?)\s*\((?:19|20)\d{2}\)/g)) loose.push(m[0]);
    for (const line of body.split("\n")) {
      const l = line.replace(/^\s*(?:[-*•+]|\d+[.)])\s*/, "").trim();
      if (l && l.length <= 70) loose.push(l);
    }
  }
  const seen = new Set();
  const out = [];
  for (const [raw, strict] of [...emphasised.map((e) => [e, false]), ...loose.map((l) => [l, true])]) {
    const c = candidate(raw, { strict });
    if (!c) continue;
    const key = c.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length === 4) break;
  }
  return out;
}

export function normalizeComments(json, thread) {
  const listing = Array.isArray(json) ? json[1] : null;
  return (listing?.data?.children || [])
    .filter((c) => c?.kind === "t1" && c.data && typeof c.data.body === "string")
    .map((c) => c.data)
    .filter((d) => d.body !== "[deleted]" && d.body !== "[removed]" && !d.stickied && d.author !== "AutoModerator")
    .map((d) => ({ body: d.body.slice(0, 1500), score: Number(d.score) || 0, thread }));
}

// Count every title once per comment, weighted by that comment's upvotes.
export function tally(comments, extract = (c) => extractTitles(c.body)) {
  const byTitle = new Map();
  for (const comment of comments) {
    for (const { title, year } of extract(comment)) {
      const key = title.toLowerCase().replace(/^the\s+/, "");
      const entry = byTitle.get(key) || { title, year, mentions: 0, votes: 0, threads: new Map() };
      entry.mentions += 1;
      entry.votes += Math.max(comment.score, 1);
      entry.year = entry.year || year;
      entry.threads.set(comment.thread.id, comment.thread);
      byTitle.set(key, entry);
    }
  }
  return [...byTitle.values()]
    .map((e) => ({ ...e, threads: [...e.threads.values()].slice(0, 2) }))
    .sort((a, b) => b.mentions - a.mentions || b.votes - a.votes)
    .slice(0, MAX_PICKS);
}

export function validatePicksRequest(params) {
  const q = typeof params.get("q") === "string" ? params.get("q").replace(/\s+/g, " ").trim().slice(0, 200) : "";
  if (!q) return null;
  return { q, kind: params.get("kind") === "tv" ? "tv" : "movie" };
}

export async function communityPicks({ q, kind }, { clientId, clientSecret, extractWithAi, fetchImpl = fetch } = {}) {
  const auth = { clientId, clientSecret, fetchImpl };
  const search = await searchReddit({ subreddits: SUBS[kind], query: q, sort: "relevance", limit: 6 }, auth);
  if (search.failed === SUBS[kind].length) throw new Error("Reddit unavailable");

  const threads = [...new Map(search.posts.map((p) => [p.id, p])).values()]
    .filter((p) => p.comments >= 3)
    .sort((a, b) => b.score + b.comments - (a.score + a.comments))
    .slice(0, MAX_THREADS);

  const lists = await Promise.allSettled(
    threads.map((t) =>
      redditGet(`/comments/${t.id}`, { sort: "top", limit: String(COMMENTS_PER_THREAD), depth: "1" }, auth).then((json) =>
        normalizeComments(json, { id: t.id, title: t.title, subreddit: t.subreddit, permalink: t.permalink }),
      ),
    ),
  );
  const comments = lists.flatMap((l) => (l.status === "fulfilled" ? l.value : []));

  let extract;
  if (extractWithAi && comments.length) {
    try {
      const perComment = await extractWithAi(comments.map((c) => c.body));
      extract = (c) => perComment[comments.indexOf(c)] || [];
    } catch {
      extract = undefined; // fall back to the rule-based extractor
    }
  }

  return { picks: tally(comments, extract), threads: threads.slice(0, 3) };
}
