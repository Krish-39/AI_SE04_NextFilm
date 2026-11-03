import { describe, expect, it } from "vitest";

import {
  applySearchFilters,
  describeSearchFilters,
  parseSearchFilters,
  searchFilterCount,
  writeSearchFilters,
} from "./searchFilters";

const film = (id, extra) => ({ id, media_type: "movie", genre_ids: [], release_date: "2010-05-01", vote_average: 7, original_language: "en", popularity: 10, title: `F${id}`, ...extra });
const show = (id, extra) => ({ id, media_type: "tv", genre_ids: [], first_air_date: "2015-01-01", vote_average: 8, original_language: "ko", popularity: 5, name: `S${id}`, ...extra });

describe("search filters", () => {
  it("round-trips through the URL and keeps q", () => {
    const f = parseSearchFilters(new URLSearchParams("q=x&type=tv&genres=878,999&from=2020&to=2010&rating=7&lang=ko&sort=rating"), 2026);
    expect(f).toEqual({ type: "tv", genres: [878], from: 2010, to: 2020, rating: "7", lang: "ko", sort: "rating" });
    expect(writeSearchFilters(new URLSearchParams("q=x&mode=describe"), f).toString()).toBe(
      "q=x&mode=describe&type=tv&genres=878&from=2010&to=2020&rating=7&lang=ko&sort=rating",
    );
    expect(searchFilterCount(f)).toBe(4);
  });

  it("filters by type, year, rating and language", () => {
    const items = [film(1), film(2, { release_date: "1995-01-01" }), show(3), film(4, { vote_average: 5 })];
    const base = parseSearchFilters(new URLSearchParams(""));
    expect(applySearchFilters(items, { ...base, type: "tv" }).map((i) => i.id)).toEqual([3]);
    expect(applySearchFilters(items, { ...base, from: 2000 }).map((i) => i.id)).toEqual([1, 3, 4]);
    expect(applySearchFilters(items, { ...base, rating: "7" }).map((i) => i.id)).toEqual([1, 2, 3]);
    expect(applySearchFilters(items, { ...base, lang: "ko" }).map((i) => i.id)).toEqual([3]);
  });

  it("matches film genres against the TV equivalents", () => {
    const items = [film(1, { genre_ids: [878] }), show(2, { genre_ids: [10765] }), show(3, { genre_ids: [35] })];
    const f = { ...parseSearchFilters(new URLSearchParams("")), genres: [878] };
    expect(applySearchFilters(items, f).map((i) => i.id)).toEqual([1, 2]);
  });

  it("sorts and describes", () => {
    const items = [film(1, { release_date: "2001-01-01" }), film(2, { release_date: "2020-01-01" })];
    const f = { ...parseSearchFilters(new URLSearchParams("")), sort: "newest" };
    expect(applySearchFilters(items, f).map((i) => i.id)).toEqual([2, 1]);
    const chips = describeSearchFilters({ ...f, genres: [18], from: 1990, to: 1999, lang: "fr" });
    expect(chips.map((c) => c.label)).toEqual(["Drama", "1990–1999", "French"]);
  });
});
