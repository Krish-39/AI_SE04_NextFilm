import { describe, expect, it } from "vitest";

import { rankForYou, topGenres } from "./forYou";

const item = (id, extra = {}) => ({ id, media_type: "movie", poster_path: `/p${id}.jpg`, genre_ids: [], vote_average: 7, ...extra });

describe("topGenres", () => {
  it("returns the most saved genres first", () => {
    const saved = [item(1, { genre_ids: [18, 878] }), item(2, { genre_ids: [878] }), item(3, { genre_ids: [35] })];
    expect(topGenres(saved, 2)).toEqual([878, 18]);
  });
});

describe("rankForYou", () => {
  const saved = [item(1, { genre_ids: [878] }), item(2, { genre_ids: [878, 18] })];

  it("never recommends something already saved", () => {
    const out = rankForYou({ saved, recLists: [[item(1), item(10)]] });
    expect(out.map((i) => i.id)).toEqual([10]);
  });

  it("ranks titles recommended by several saved titles higher", () => {
    const out = rankForYou({ saved, recLists: [[item(10), item(11)], [item(11)]] });
    expect(out[0].id).toBe(11);
  });

  it("uses genre overlap to break ties", () => {
    const out = rankForYou({ saved, genrePicks: [item(20, { genre_ids: [35] }), item(21, { genre_ids: [878] })] });
    expect(out.map((i) => i.id)).toEqual([21, 20]);
  });

  it("treats a film and a series with the same id as different titles", () => {
    const out = rankForYou({ saved, recLists: [[item(1, { media_type: "tv" })]] });
    expect(out).toHaveLength(1);
  });

  it("skips items without posters and respects the limit", () => {
    const many = Array.from({ length: 30 }, (_, i) => item(100 + i));
    many[0].poster_path = null;
    const out = rankForYou({ saved, recLists: [many], limit: 5 });
    expect(out).toHaveLength(5);
    expect(out.some((i) => i.id === 100)).toBe(false);
  });
});
