import { useMemo } from "react";

import { useWatchlist } from "../lib/contexts";
import { rankForYou, topGenres } from "../lib/forYou";
import { titleOf, tmdb } from "../lib/tmdb";
import { useAsync } from "../lib/useAsync";
import Rail from "./Rail";

async function loadForYou(saved) {
  const recent = saved.slice(0, 4);
  const movieGenres = topGenres(saved.filter((i) => i.media_type !== "tv"), 2);
  const [recLists, genrePicks] = await Promise.all([
    Promise.all(recent.map((i) => tmdb.recommendations(i.media_type === "tv" ? "tv" : "movie", i.id).catch(() => []))),
    movieGenres.length
      ? tmdb
          .discover("movie", { with_genres: movieGenres.join("|"), sort_by: "popularity.desc", "vote_count.gte": 300 })
          .then((r) => r.results)
          .catch(() => [])
      : [],
  ]);
  return rankForYou({ saved, recLists, genrePicks });
}

const joinTitles = (titles) =>
  titles.length <= 1 ? titles[0] : `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;

export default function ForYouRail() {
  const { items, status } = useWatchlist();
  const signature = useMemo(() => items.slice(0, 4).map((i) => `${i.media_type}-${i.id}`).join(","), [items]);
  const ready = status === "ready" && items.length > 0;
  const { data, loading, error } = useAsync(() => (ready ? loadForYou(items) : []), [ready, signature]);

  if (!ready || (!loading && !error && data?.length === 0)) return null;

  return (
    <Rail
      id="for-you"
      title="Picked for you"
      subtitle={`Because you saved ${joinTitles(items.slice(0, 3).map(titleOf))}`}
      items={data}
      loading={loading}
      error={error}
    />
  );
}
