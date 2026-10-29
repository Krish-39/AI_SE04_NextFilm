import { afterEach, describe, expect, it, vi } from "vitest";

import { watchlistErrorMessage } from "./firestoreError";

describe("watchlistErrorMessage", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  afterEach(() => spy.mockClear());

  it("explains permission problems instead of blaming the connection", () => {
    expect(watchlistErrorMessage({ code: "permission-denied" })).toMatch(/permission denied/);
  });

  it("recognises the offline client error", () => {
    expect(watchlistErrorMessage({ code: "unavailable", message: "Failed to get document because the client is offline." })).toMatch(
      /ad blocker/,
    );
  });

  it("includes unknown codes and always logs the raw error", () => {
    expect(watchlistErrorMessage({ code: "aborted" }, "remove that")).toBe("Couldn’t remove that (aborted). Try again in a moment.");
    expect(spy).toHaveBeenCalled();
  });
});
