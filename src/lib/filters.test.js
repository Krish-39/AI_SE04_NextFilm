import { describe, expect, it } from "vitest";

import {
  activeFilterCount,
  clearFilters,
  describeFilters,
  parseFilters,
  toDiscoverParams,
  toSearchParams,
} from "./filters";

const parse = (qs) => parseFilters(new URLSearchParams(qs), 2026);

describe("parseFilters", () => {
  it("returns defaults for an empty URL", () => {
    expect(parse("")).toEqual({
      type: "movie",
      genres: [],
      from: null,
      to: null,
      rating: "",
      runtime: "",
      lang: "",
      providers: [],
      sort: "popular",
    });
  });

  it("reads every filter", () => {
    expect(parse("type=movie&genres=35,10749&from=1990&to=1999&rating=7&runtime=short&lang=fr&providers=8,337&sort=rating")).toEqual({
      type: "movie",
      genres: [35, 10749],
      from: 1990,
      to: 1999,
      rating: "7",
      runtime: "short",
      lang: "fr",
      providers: [8, 337],
      sort: "rating",
    });
  });

  it("drops junk and genres that don't belong to the type", () => {
    const f = parse("type=tv&genres=28,18,abc,-3&rating=11&sort=hack&lang=xx&runtime=short&from=1800");
    expect(f.genres).toEqual([18]); // 28 is a film-only genre
    expect(f.rating).toBe("");
    expect(f.sort).toBe("popular");
    expect(f.lang).toBe("");
    expect(f.runtime).toBe(""); // runtime is films only
    expect(f.from).toBeNull();
  });

  it("swaps a reversed year range", () => {
    const f = parse("from=2010&to=2000");
    expect([f.from, f.to]).toEqual([2000, 2010]);
  });
});

describe("toSearchParams", () => {
  it("round-trips through parseFilters", () => {
    const qs = "type=tv&genres=18,80&from=2015&rating=8&lang=ko&providers=8&sort=newest";
    expect(parse(toSearchParams(parse(qs)).toString())).toEqual(parse(qs));
  });

  it("leaves defaults out of the URL", () => {
    expect(toSearchParams(parse("")).toString()).toBe("");
  });
});

describe("toDiscoverParams", () => {
  it("maps film filters to TMDB discover params", () => {
    const p = toDiscoverParams(parse("genres=35,10749&from=1990&to=1999&rating=7&runtime=medium&lang=fr&providers=8,337"), {
      region: "DE",
    });
    expect(p).toMatchObject({
      with_genres: "35,10749",
      "primary_release_date.gte": "1990-01-01",
      "primary_release_date.lte": "1999-12-31",
      "vote_average.gte": "7",
      "vote_count.gte": 200,
      "with_runtime.gte": 90,
      "with_runtime.lte": 120,
      with_original_language: "fr",
      with_watch_providers: "8|337",
      watch_region: "DE",
      sort_by: "popularity.desc",
    });
  });

  it("uses first_air_date and name sorting for series", () => {
    const p = toDiscoverParams(parse("type=tv&from=2020&sort=title"));
    expect(p["first_air_date.gte"]).toBe("2020-01-01");
    expect(p.sort_by).toBe("name.asc");
    expect(p).not.toHaveProperty("with_runtime.gte");
  });

  it("caps 'newest' at today so unreleased titles don't flood it", () => {
    const p = toDiscoverParams(parse("sort=newest"), { today: "2026-10-28" });
    expect(p.sort_by).toBe("primary_release_date.desc");
    expect(p["primary_release_date.lte"]).toBe("2026-10-28");
  });

  it("requires enough votes when sorting by rating", () => {
    expect(toDiscoverParams(parse("sort=rating"))["vote_count.gte"]).toBe(300);
  });

  it("ignores providers when no region is known", () => {
    expect(toDiscoverParams(parse("providers=8"))).not.toHaveProperty("with_watch_providers");
  });
});

describe("chips and counts", () => {
  it("counts active filters and builds removable chips", () => {
    const f = parse("genres=35,18&from=2000&to=2000&rating=8&providers=8");
    expect(activeFilterCount(f)).toBe(5);
    const chips = describeFilters(f, { 8: "Netflix" });
    expect(chips.map((c) => c.label)).toEqual(["Comedy", "Drama", "2000", "Rated 8+", "Netflix"]);
    expect(chips[0].next.genres).toEqual([18]);
  });

  it("clearFilters keeps type and sort", () => {
    const cleared = clearFilters(parse("type=tv&genres=18&sort=rating"));
    expect(cleared.type).toBe("tv");
    expect(cleared.sort).toBe("rating");
    expect(activeFilterCount(cleared)).toBe(0);
  });
});
