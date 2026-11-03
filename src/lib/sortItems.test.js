import { describe, expect, it } from "vitest";

import { sortItems } from "./sortItems";

const items = [
  { id: 1, title: "beta", vote_average: 7, release_date: "2001-01-01", addedAt: 3 },
  { id: 2, name: "Alpha", vote_average: 9, first_air_date: "2019-05-01", addedAt: 1 },
  { id: 3, title: "Gamma", vote_average: null, release_date: "", addedAt: 2 },
];
const ids = (list) => list.map((i) => i.id);

describe("sortItems", () => {
  it("sorts by date added by default", () => expect(ids(sortItems(items, "added"))).toEqual([1, 3, 2]));
  it("sorts titles case-insensitively, films and series together", () =>
    expect(ids(sortItems(items, "title"))).toEqual([2, 1, 3]));
  it("puts unrated titles last", () => expect(ids(sortItems(items, "rating"))).toEqual([2, 1, 3]));
  it("puts undated titles last when sorting by release", () =>
    expect(ids(sortItems(items, "newest"))).toEqual([2, 1, 3]));
  it("doesn't mutate the input", () => {
    sortItems(items, "title");
    expect(ids(items)).toEqual([1, 2, 3]);
  });
});
