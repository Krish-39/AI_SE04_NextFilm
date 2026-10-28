import { useState } from "react";

import AskBar from "../components/AskBar";
import ForYouRail from "../components/ForYouRail";
import Hero from "../components/Hero";
import Rail from "../components/Rail";
import StateMessage from "../components/StateMessage";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { GENRE_NAMES, GENRES, hasTmdbKey, tmdb } from "../lib/tmdb";
import { KeyRound } from "lucide-react";
import "./Home.css";

const RAILS = [
  { id: "trending", title: "Top 10 films this week", load: () => tmdb.trending("movie"), ranked: true },
  { id: "trending-series", title: "Series everyone’s watching", load: () => tmdb.trending("tv"), href: "/browse?type=tv" },
  { id: "top-rated", title: "Highest rated films", load: () => tmdb.topRated("movie"), href: "/browse?sort=rating" },
  { id: "top-rated-series", title: "Highest rated series", load: () => tmdb.topRated("tv"), href: "/browse?type=tv&sort=rating" },
  { id: "action", title: "Action", load: () => tmdb.byGenre(GENRES.action), href: `/browse?genres=${GENRES.action}` },
  { id: "comedy", title: "Comedy", load: () => tmdb.byGenre(GENRES.comedy), href: `/browse?genres=${GENRES.comedy}` },
  { id: "scifi", title: "Science fiction", load: () => tmdb.byGenre(GENRES.scifi), href: `/browse?genres=${GENRES.scifi}` },
  { id: "horror", title: "Horror", load: () => tmdb.byGenre(GENRES.horror), href: `/browse?genres=${GENRES.horror}` },
];

function LoadedRail({ rail }) {
  const [attempt, setAttempt] = useState(0);
  const { data, error, loading } = useAsync(rail.load, [attempt]);
  return (
    <Rail
      id={rail.id}
      title={rail.title}
      items={data}
      loading={loading}
      error={error}
      ranked={rail.ranked}
      href={rail.href}
      onRetry={() => setAttempt((a) => a + 1)}
    />
  );
}

export default function Home() {
  useDocumentTitle(null);
  const trending = useAsync(() => tmdb.trending("movie"), []);

  if (!hasTmdbKey) {
    return (
      <main id="main" className="page">
        <StateMessage icon={KeyRound} title="Add your TMDB key to see films">
          Create a <code>.env</code> file with <code>VITE_TMDB_API_KEY=…</code> and restart <code>npm run dev</code>.
        </StateMessage>
      </main>
    );
  }

  return (
    <main id="main" className="home">
      <Hero items={trending.data} genres={GENRE_NAMES} />
      <AskBar />
      <ForYouRail />
      {RAILS.map((rail) => (
        <LoadedRail key={rail.id} rail={rail} />
      ))}
    </main>
  );
}
