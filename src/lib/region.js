import { useSyncExternalStore } from "react";

// Countries offered for "Where to watch" and streaming filters.
export const REGIONS = [
  ["US", "United States"], ["GB", "United Kingdom"], ["DE", "Germany"], ["AT", "Austria"], ["CH", "Switzerland"],
  ["FR", "France"], ["ES", "Spain"], ["IT", "Italy"], ["NL", "Netherlands"], ["SE", "Sweden"], ["IN", "India"],
  ["CA", "Canada"], ["AU", "Australia"], ["BR", "Brazil"], ["MX", "Mexico"], ["JP", "Japan"], ["KR", "South Korea"],
  ["TR", "Turkey"], ["PL", "Poland"], ["IE", "Ireland"],
];

const KEY = "nextfilm-region";
const known = (code) => REGIONS.some(([c]) => c === code);

export function guessRegion(languages) {
  for (const tag of languages || []) {
    const code = tag.split("-")[1]?.toUpperCase();
    if (known(code)) return code;
  }
  return "US";
}

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    if (known(saved)) return saved;
  } catch {
    // Storage blocked (private mode); fall back to the browser language.
  }
  return guessRegion(typeof navigator === "undefined" ? [] : navigator.languages || [navigator.language]);
}

const listeners = new Set();
let current = typeof window === "undefined" ? "US" : read();

export function setRegion(code) {
  if (!known(code)) return;
  current = code;
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // Not persisted; still applies for this visit.
  }
  listeners.forEach((l) => l());
}

export function useRegion() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "US",
  );
}
