import { describe, expect, it } from "vitest";

import { guessRegion } from "./region";

describe("guessRegion", () => {
  it("uses the first supported country in the browser languages", () => {
    expect(guessRegion(["de-DE", "en-US"])).toBe("DE");
    expect(guessRegion(["en", "fr-FR"])).toBe("FR");
  });

  it("falls back to US", () => {
    expect(guessRegion(["en"])).toBe("US");
    expect(guessRegion(["xx-ZZ"])).toBe("US");
    expect(guessRegion([])).toBe("US");
  });
});
