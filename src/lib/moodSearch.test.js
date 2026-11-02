import { describe, expect, it } from "vitest";

import { discoverAttempts, discoverFor, isFilmRequest, parseRequest, referenceOf, withFilters } from "./moodSearch";

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

describe("isFilmRequest", () => {
  it.each(["chicken masala", "mongo rice with banana", "pizza with pineapple and cheese", "how to fix my car engine"])(
    "rejects %s",
    (q) => expect(isFilmRequest(parseRequest(q, 2026))).toBe(false),
  );

  it.each(["a sad space movie", "something to watch with my mom", "korean thriller", "best of the 90s", "a show about chefs"])(
    "accepts %s",
    (q) => expect(isFilmRequest(parseRequest(q, 2026))).toBe(true),
  );

  it("needs a confirmed reference when that is the only signal", () => {
    const p = parseRequest("something like Paddington", 2026);
    expect(p.reference).toBe("Paddington");
    expect(isFilmRequest(p, false)).toBe(false);
    expect(isFilmRequest(p, true)).toBe(true);
  });
});

describe("referenceOf", () => {
  it("finds the title after like / similar to", () => {
    expect(referenceOf("Something like Arrival, but cosier")).toBe("Arrival");
    expect(referenceOf("movies similar to the movie Knives Out with a twist")).toBe("Knives Out");
    expect(referenceOf("a sad space movie")).toBe(null);
  });

  it("keeps reference words out of the keywords", () => {
    expect(parseRequest("movies like interstellar but funnier", 2026)).toMatchObject({ reference: "interstellar", keywords: [], genres: [35] });
  });
});

describe("withFilters", () => {
  const parsed = parseRequest("a sad space movie from the 90s", 2026);

  it("lets filters override type, years and language and adds genres", () => {
    const spec = withFilters(parsed, { type: "tv", genres: [35], from: 2000, to: null, rating: "8", lang: "ko" });
    expect(spec).toMatchObject({ type: "tv", from: 2000, to: 1999, lang: "ko", rating: "8" });
    expect(spec.genres).toEqual([18, 10765, 35]);
  });

  it("keeps the request as is without filters", () => {
    expect(withFilters(parsed, { type: "all", genres: [], from: null, to: null, rating: "", lang: "" })).toMatchObject({
      type: "movie",
      genres: [18, 878],
      from: 1990,
      to: 1999,
    });
  });
});

describe("discoverFor", () => {
  const fake = (pages) => ({
    keyword: async (w) => (w === "space" ? 9882 : null),
    discover: async (kind, params) => ({ results: pages(params) }),
  });

  it("falls back to looser attempts until there are enough results", async () => {
    const seen = [];
    const items = await discoverFor(parseRequest("a sad space movie", 2026), {
      tmdb: fake((p) => {
        seen.push(p.with_keywords ? "kw" : p.with_genres);
        return p.with_keywords ? [{ id: 1 }] : Array.from({ length: 9 }, (_, i) => ({ id: i + 10 }));
      }),
    });
    expect(seen).toEqual(["kw", "18,878"]);
    expect(items).toHaveLength(9);
  });
});
