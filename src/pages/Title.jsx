import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clapperboard, Play, Star } from "lucide-react";

import CommunityBuzz from "../components/CommunityBuzz";
import Rail from "../components/Rail";
import StateMessage from "../components/StateMessage";
import TrailerDialog from "../components/TrailerDialog";
import WatchlistButton from "../components/WatchlistButton";
import WhereToWatch from "../components/WhereToWatch";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { image, ratingOf, runtimeOf, titleOf, tmdb, trailerOf, yearOf } from "../lib/tmdb";
import "./Title.css";

export default function Title({ kind }) {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(0);
  const { data, error, loading } = useAsync(() => tmdb.details(kind, id), [kind, id, attempt]);
  const [trailerOpen, setTrailerOpen] = useState(false);
  useDocumentTitle(data ? titleOf(data) : null);

  if (error) {
    return (
      <main id="main" className="page">
        <StateMessage
          icon={Clapperboard}
          title="We couldn’t load this title"
          action={
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
                Try again
              </button>
              <Link to="/" className="btn btn-ghost">
                Back home
              </Link>
            </div>
          }
        >
          It may have been removed from TMDB, or your connection dropped.
        </StateMessage>
      </main>
    );
  }

  if (loading || !data) return <TitleSkeleton />;

  const trailer = trailerOf(data);
  const rating = ratingOf(data);
  const runtime = runtimeOf(data);
  const director =
    kind === "movie"
      ? data.credits?.crew?.find((c) => c.job === "Director")?.name
      : data.created_by?.map((c) => c.name).join(", ");
  const cast = (data.credits?.cast || []).slice(0, 12);
  const seasons = kind === "tv" && data.number_of_seasons;

  return (
    <main id="main" className="title-page">
      <section className="title-hero">
        {data.backdrop_path && (
          <img
            className="title-hero__backdrop"
            src={image(data.backdrop_path, "w1280")}
            srcSet={`${image(data.backdrop_path, "w780")} 780w, ${image(data.backdrop_path, "w1280")} 1280w, ${image(data.backdrop_path, "original")} 1920w`}
            sizes="100vw"
            alt=""
            fetchPriority="high"
          />
        )}
        <div className="title-hero__inner">
          {data.poster_path && (
            <img
              className="title-hero__poster"
              src={image(data.poster_path, "w500")}
              alt={`${titleOf(data)} poster`}
              width="500"
              height="750"
            />
          )}
          <div className="title-hero__copy">
            <p className="title-hero__kind">
              <span className="poster-badge">{kind === "tv" ? "Series" : "Film"}</span>
            </p>
            <h1 className="display title-hero__title">{titleOf(data)}</h1>
            {data.tagline && <p className="title-hero__tagline">{data.tagline}</p>}
            <p className="meta title-hero__meta">
              {yearOf(data) && <span>{yearOf(data)}</span>}
              {runtime && <span>{runtime}</span>}
              {seasons && (
                <span>
                  {seasons} season{seasons > 1 ? "s" : ""}
                </span>
              )}
              {rating && (
                <span className="rating">
                  <Star size={14} fill="currentColor" aria-hidden="true" /> {rating}
                  <span className="title-hero__votes">({data.vote_count?.toLocaleString()} votes)</span>
                </span>
              )}
            </p>
            {data.genres?.length > 0 && (
              <ul className="genre-list" aria-label="Genres">
                {data.genres.map((g) => (
                  <li key={g.id}>{g.name}</li>
                ))}
              </ul>
            )}
            <div className="title-hero__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setTrailerOpen(true)}
                disabled={!trailer}
                title={trailer ? undefined : "No trailer available"}
              >
                <Play size={18} fill="currentColor" aria-hidden="true" />
                {trailer ? "Play trailer" : "No trailer yet"}
              </button>
              <WatchlistButton item={data} />
            </div>
          </div>
        </div>
      </section>

      <section className="title-body">
        <div className="title-body__main">
          <div className="title-body__overview">
            <h2 className="section-title tape">Overview</h2>
            <p>{data.overview || "No overview available yet."}</p>
          </div>
          <WhereToWatch kind={kind} id={data.id} title={titleOf(data)} />
        </div>
        <dl className="facts">
          {director && (
            <div>
              <dt>{kind === "movie" ? "Director" : "Created by"}</dt>
              <dd>{director}</dd>
            </div>
          )}
          {data.status && (
            <div>
              <dt>Status</dt>
              <dd>{data.status}</dd>
            </div>
          )}
          {data.spoken_languages?.[0] && (
            <div>
              <dt>Language</dt>
              <dd>{data.spoken_languages.map((l) => l.english_name).join(", ")}</dd>
            </div>
          )}
        </dl>
      </section>

      {cast.length > 0 && (
        <section className="cast" aria-labelledby="cast-title">
          <h2 className="section-title tape tape--tilt-r" id="cast-title">
            Cast
          </h2>
          <ul className="cast__list">
            {cast.map((person) => (
              <li key={`${person.id}-${person.character}`}>
                <div className="cast__photo">
                  {person.profile_path ? (
                    <img src={image(person.profile_path, "w185")} alt="" loading="lazy" width="185" height="278" />
                  ) : (
                    <span aria-hidden="true">{person.name[0]}</span>
                  )}
                </div>
                <p className="cast__name">{person.name}</p>
                {person.character && <p className="cast__role">{person.character}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="title-buzz">
        <CommunityBuzz title={titleOf(data)} kind={kind} />
      </div>

      {data.similar?.length > 0 && (
        <Rail id="similar" title={`More like ${titleOf(data)}`} items={data.similar.filter((s) => s.poster_path)} />
      )}

      {trailerOpen && trailer && (
        <TrailerDialog video={trailer} title={titleOf(data)} onClose={() => setTrailerOpen(false)} />
      )}
    </main>
  );
}

function TitleSkeleton() {
  return (
    <main id="main" className="title-page" aria-busy="true">
      <section className="title-hero">
        <div className="title-hero__inner">
          <div className="title-hero__poster skeleton" style={{ aspectRatio: "2 / 3" }} />
          <div className="title-hero__copy">
            <div className="skeleton" style={{ height: 64, width: "min(520px, 80vw)" }} />
            <div className="skeleton" style={{ height: 16, width: 240, marginTop: 20 }} />
            <div className="skeleton" style={{ height: 44, width: 280, marginTop: 28 }} />
          </div>
        </div>
      </section>
    </main>
  );
}
