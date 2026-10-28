import { describe, expect, it } from "vitest";

import { mergePicks, withTimeout } from "./merge";

describe("mergePicks", () => {
  it("keeps AI order, appends community picks, flags overlaps", () => {
    const ai = [{ id: 1, media_type: "movie" }, { id: 2, media_type: "movie" }, null];
    const reddit = [{ id: 2, media_type: "movie" }, { id: 2, media_type: "tv" }, { id: 3 }];
    expect(mergePicks(ai, reddit)).toEqual([
      { id: 1, media_type: "movie" },
      { id: 2, media_type: "movie", fromReddit: true },
      { id: 2, media_type: "tv", fromReddit: true },
      { id: 3, fromReddit: true },
    ]);
  });

  it("dedupes repeated AI picks", () => {
    expect(mergePicks([{ id: 1 }, { id: 1 }], [])).toHaveLength(1);
  });
});

describe("withTimeout", () => {
  it("resolves with the fallback when the promise is too slow", async () => {
    await expect(withTimeout(new Promise(() => {}), 10, "late")).resolves.toBe("late");
    await expect(withTimeout(Promise.resolve("fast"), 50, "late")).resolves.toBe("fast");
  });
});
