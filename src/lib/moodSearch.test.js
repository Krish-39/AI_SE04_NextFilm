import { describe, expect, it } from "vitest";

import { discoverAttempts, moodSearch, parseRequest } from "./moodSearch";

describe("parseRequest", () => {
  it("reads moods, topics and keywords", () => {
    const p = parseRequest("a sad space movie", 2026);
    expect(p.type).toBe("movie");
    expect(p.genres).toEqual([18, 878]);
    expect(p.keywords).toEqual(["space"]);
  });

  it("detects series, languages and decades", () => {
    const p = parseRequest("funny korean series from the 2010s", 2026);
    expect(p).toMatchObject({ type: "tv", lang: "ko", from: 2010, to: 2019, genres: [35] });
  });

  it("understands short decades, quality words and leftover topics", () => {
    const p = parseRequest("best heist films of the 90s set in paris", 2026);
    expect(p).toMatchObject({ from: 1990, to: 1999, rating: "7", genres: [80] });
    expect(p.keywords).toEqual(["heist", "paris"]);
  });

  it("uses keywords for moods that have no TV genre", () => {
    expect(parseRequest("scary tv show", 2026)).toMatchObject({ type: "tv", genres: [], keywords: ["scary"] });
  });

  it("handles anime and year ranges", () => {
    expect(parseRequest("anime between 1995 to 2005", 2026)).toMatchObject({ lang: "ja", genres: [16], from: 1995, to: 2005 });
  });
});

describe("discoverAttempts", () => {
  it("goes from strict to loose", () => {
    const attempts = discoverAttempts({ type: "movie", genres: [18, 878], from: 1990, to: 1999, lang: "", rating: "", runtime: "" }, [9882]);
    expect(attempts.map((a) => [a.with_keywords, a.with_genres])).toEqual([
      ["9882", "18,878"],
      [undefined, "18,878"],
      [undefined, "18|878"],
    ]);
    expect(attempts[0]["primary_release_date.gte"]).toBe("1990-01-01");
  });

  it("uses first_air_date for series", () => {
    const [a] = discoverAttempts({ type: "tv", genres: [35], from: 2010, to: null, lang: "ko", rating: "7", runtime: "" }, []);
    expect(a).toMatchObject({ "first_air_date.gte": "2010-01-01", with_original_language: "ko", "vote_average.gte": "7" });
  });
});

describe("moodSearch", () => {
  const fake = (pages) => ({
    keyword: async (w) => (w === "space" ? 9882 : null),
    discover: async (kind, params) => ({ results: pages(params) }),
  });

  it("falls back to looser attempts until there are enough results", async () => {
    const seen = [];
    const { items } = await moodSearch("a sad space movie", {
      tmdb: fake((p) => {
        seen.push(p.with_keywords ? "kw" : p.with_genres);
        return p.with_keywords ? [{ id: 1 }] : Array.from({ length: 9 }, (_, i) => ({ id: i + 10 }));
      }),
    });
    expect(seen).toEqual(["kw", "18,878"]);
    expect(items).toHaveLength(9);
  });

  it("returns nothing when it understands nothing", async () => {
    const { items } = await moodSearch("xyzzy plugh", { tmdb: fake(() => [{ id: 1 }]) });
    expect(items).toEqual([]);
  });
});
