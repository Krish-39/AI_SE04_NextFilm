// Turn a Firestore error into something a person can act on.
// The raw error is always logged so the real cause is visible in DevTools.
export function watchlistErrorMessage(error, action = "save that") {
  console.error("Watchlist error:", error?.code, error);
  const offline = /offline|network|failed to get document because the client is offline/i.test(error?.message || "");
  switch (offline ? "unavailable" : error?.code) {
    case "permission-denied":
      return `The database refused to ${action} (permission denied). Its security rules need updating; see “Database rules” in the README.`;
    case "unauthenticated":
      return "Your session has expired. Sign in again and try once more.";
    case "unavailable":
    case "deadline-exceeded":
      return "Couldn’t reach the database. If an ad blocker, privacy extension or VPN is on, allow firestore.googleapis.com and retry.";
    case "not-found":
      return "The database isn’t set up for this Firebase project yet.";
    case "resource-exhausted":
      return "The database is over its free quota for today. Try again later.";
    default:
      return `Couldn’t ${action}${error?.code ? ` (${error.code})` : ""}. Try again in a moment.`;
  }
}
