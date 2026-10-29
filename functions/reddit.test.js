import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizePosts, searchReddit, validateRedditRequest } from "./reddit.js";

test("validateRedditRequest only allows known subreddits", () => {
  const v = validateRedditRequest({ subreddits: ["movies", "MOVIESUGGESTIONS", "evil", 3, "movies"], query: "  dune  ", sort: "top", limit: 50 });
  assert.deepEqual(v, { subreddits: ["movies", "MovieSuggestions"], query: "dune", sort: "top", limit: 10 });
});

test("validateRedditRequest rejects empty input and defaults the rest", () => {
  assert.equal(validateRedditRequest({ subreddits: ["evil"], query: "x" }), null);
  assert.equal(validateRedditRequest({ subreddits: ["movies"], query: "   " }), null);
  assert.deepEqual(validateRedditRequest({ subreddits: ["movies"], query: "x", sort: "hack" }), {
    subreddits: ["movies"], query: "x", sort: "relevance", limit: 10,
  });
});

test("normalizePosts drops NSFW, pinned and malformed posts", () => {
  const json = { data: { children: [
    { data: { id: "a", title: "Hi", score: 3, num_comments: 1, permalink: "/r/movies/a/", subreddit: "movies" } },
    { data: { id: "b", title: "x", over_18: true } },
    { data: { id: "c", title: "y", stickied: true } },
    {},
  ] } };
  assert.equal(normalizePosts(json, "movies").length, 1);
});

const fakeFetch = (routes) => async (url, init) => {
  for (const [match, respond] of routes) if (url.includes(match)) return respond(url, init);
  return { ok: false, status: 404, json: async () => ({}) };
};
const listing = (id) => ({ ok: true, json: async () => ({ data: { children: [{ data: { id, title: `T ${id}`, permalink: `/r/x/${id}/` } }] } }) });

test("searchReddit uses OAuth when credentials work", async () => {
  const seen = [];
  const fetchImpl = fakeFetch([
    ["access_token", async () => ({ ok: true, json: async () => ({ access_token: "tok", expires_in: 3600 }) })],
    ["oauth.reddit.com", async (url, init) => (seen.push(init.headers.Authorization), listing(url.includes("/r/movies/") ? "m" : "s"))],
  ]);
  const r = await searchReddit({ subreddits: ["movies", "flicks"], query: "q1", sort: "top", limit: 5 }, { clientId: "id", clientSecret: "secret", fetchImpl });
  assert.equal(r.failed, 0);
  assert.equal(r.posts.length, 2);
  assert.deepEqual(seen, ["Bearer tok", "Bearer tok"]);
});

test("searchReddit reports partial failures instead of throwing", async () => {
  const fetchImpl = fakeFetch([["/r/movies/", async () => listing("ok")]]);
  const r = await searchReddit({ subreddits: ["movies", "TrueFilm"], query: "q2", sort: "top", limit: 5 }, { fetchImpl });
  assert.equal(r.posts.length, 1);
  assert.equal(r.failed, 1);
});
