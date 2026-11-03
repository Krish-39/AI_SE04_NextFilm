import { describe, expect, it } from "vitest";

import { cleanTitleResults, constraintsFor, rank, understand } from "./clerk";
import { parseRequest, withFilters } from "./moodSearch";

const film = (id, extra) => ({ id, media_type: "movie", title: `F${id}`, genre_ids: [], vote_count: 500, vote_average: 7, release_date: "2015-01-01", original_language: "en", ...extra });
const noFilters = { type: "all", genres: [], from: null, to: null, rating: "", lang: "", sort: "best" };

describe("understand", () => {
  const tmdb = {
    findTitle: async (t) => (t.toLowerCase() === "knives out" ? film(1, { title: "Knives Out", vote_count: 9000 }) : film(2, { vote_count: 3 })),
    matchTitle: async (t) => (t.toLowerCase() === "the lord of the rings" ? film(3) : null),
  };

  it("accepts film requests", async () => {
    expect((await understand("a sad space movie", { tmdb })).kind).toBe("film");
  });

  it("accepts a well-known reference title on its own", async () => {
    const u = await understand("something like Knives Out", { tmdb });
    expect(u.kind).toBe("film");
    expect(u.reference.title).toBe("Knives Out");
  });

  it("ignores obscure reference matches", async () => {
    expect((await understand("something like Banana Rice", { tmdb })).kind).toBe("none");
  });

  it("treats exact long titles as titles", async () => {
    expect((await understand("the lord of the rings", { tmdb })).kind).toBe("title");
  });

  it("asks the AI before rejecting wording the rules don't know", async () => {
    expect((await understand("that one where a guy wakes up on the same day", { tmdb, aiCheck: async () => [film(7), film(8)] })).kind).toBe("film");
    expect((await understand("mongo rice with banana", { tmdb, aiCheck: async () => [] })).kind).toBe("none");
    expect((await understand("mongo rice with banana", { tmdb, aiCheck: async () => { throw new Error("down"); } })).kind).toBe("none");
  });

  it("rejects food and other non-film text", async () => {
    expect((await understand("mongo rice with banana", { tmdb })).kind).toBe("none");
    expect((await understand("chicken masala", { tmdb })).kind).toBe("none");
  });
});

describe("rank", () => {
  const spec = withFilters(parseRequest("a sad space movie", 2026), noFilters);

  it("ranks titles that several sources agree on first", () => {
    const out = rank(
      { ai: [film(1)], similar: [], discover: [film(2), film(1), film(3, { genre_ids: [18, 878] })] },
      { spec, filters: noFilters },
    );
    expect(out.map((i) => i.id)).toEqual([1, 3, 2]);
    expect(out[0].sources).toEqual(["ai", "discover"]);
  });

  it("drops obscure entries, excluded ones and the reference itself", () => {
    const out = rank(
      { ai: [film(4, { vote_count: 2 })], similar: [film(5), film(9)], discover: [film(6)] },
      { spec, filters: noFilters, reference: film(9), exclude: new Set(["movie-6"]) },
    );
    expect(out.map((i) => i.id)).toEqual([5]);
  });

  it("applies the filters to every source, AI included", () => {
    const filters = { ...noFilters, from: 2020, lang: "ko" };
    const out = rank(
      { ai: [film(1, { release_date: "2021-01-01" }), film(2, { release_date: "2021-01-01", original_language: "ko" })], discover: [film(3, { original_language: "ko" })] },
      { spec, filters },
    );
    expect(out.map((i) => i.id)).toEqual([2]);
  });
});

describe("constraintsFor", () => {
  it("passes the filters and explicit wishes to the AI", () => {
    const spec = withFilters(parseRequest("funny korean series", 2026), { ...noFilters, from: 2010, rating: "7" });
    expect(constraintsFor(spec, { ...noFilters, genres: [35] })).toEqual({ type: "tv", from: "2010", lang: "ko", rating: "7", genres: "35" });
  });
});

describe("cleanTitleResults", () => {
  it("drops near-empty entries unless the title is exact", () => {
    const items = [film(1, { title: "Chicken Run", vote_count: 4000 }), film(2, { title: "Chicken Masala Story", vote_count: 0 }), film(3, { title: "Chicken Masala", vote_count: 0 })];
    expect(cleanTitleResults(items, "chicken masala").map((i) => i.id)).toEqual([1, 3]);
  });
});
