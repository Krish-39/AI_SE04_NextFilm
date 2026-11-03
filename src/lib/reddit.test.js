import { describe, expect, it } from "vitest";

import { buzzScore, normalizePosts, rankPosts } from "./reddit";

const post = (id, score, comments, extra = {}) => ({
  id,
  title: `Post ${id}`,
  subreddit: "movies",
  score,
  num_comments: comments,
  permalink: `/r/movies/comments/${id}/`,
  created_utc: 1700000000,
  ...extra,
});

describe("normalizePosts", () => {
  it("maps Reddit listing JSON and drops NSFW and pinned posts", () => {
    const json = { data: { children: [post("a", 10, 2), post("b", 5, 1, { over_18: true }), post("c", 1, 0, { stickied: true }), {}].map((d) => ({ data: d })) } };
    expect(normalizePosts(json, "movies")).toEqual([
      {
        id: "a",
        title: "Post a",
        subreddit: "movies",
        score: 10,
        comments: 2,
        created: 1700000000,
        permalink: "https://www.reddit.com/r/movies/comments/a/",
      },
    ]);
  });

  it("survives empty or malformed responses", () => {
    expect(normalizePosts(null)).toEqual([]);
    expect(normalizePosts({ data: {} })).toEqual([]);
  });
});

describe("rankPosts", () => {
  it("dedupes across subreddits and sorts by engagement", () => {
    const a = { id: "a", score: 5, comments: 5 };
    const b = { id: "b", score: 50, comments: 1 };
    expect(rankPosts([[a, b], [a]]).map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: String(i), score: i, comments: 0 }));
    expect(rankPosts([many], 15)).toHaveLength(15);
  });
});

describe("buzzScore", () => {
  it("is zero with no discussions", () => {
    expect(buzzScore([])).toEqual({ score: 0, discussions: 0, engagement: 0 });
  });

  it("grows with engagement and caps at 100", () => {
    const small = buzzScore([{ score: 9, comments: 0 }]);
    const big = buzzScore([{ score: 50000, comments: 9000 }]);
    expect(small.score).toBe(22);
    expect(big.score).toBe(100);
    expect(big.discussions).toBe(1);
  });
});
