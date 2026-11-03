import { titleOf, yearOf } from "./tmdb";

export const WATCHLIST_SORTS = [
  ["added", "Recently added"],
  ["title", "Title A–Z"],
  ["rating", "Highest rated"],
  ["newest", "Newest release"],
];

export function sortItems(items, sort) {
  const list = [...items];
  switch (sort) {
    case "title":
      return list.sort((a, b) => titleOf(a).localeCompare(titleOf(b), undefined, { sensitivity: "base" }));
    case "rating":
      return list.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    case "newest":
      return list.sort((a, b) => (yearOf(b) || "0").localeCompare(yearOf(a) || "0"));
    default:
      return list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }
}
