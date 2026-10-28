import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Info, Play, Star } from "lucide-react";

import { useToast } from "../lib/contexts";
import { image, pathOf, ratingOf, titleOf, tmdb, trailerOf, yearOf } from "../lib/tmdb";
import TrailerDialog from "./TrailerDialog";
import WatchlistButton from "./WatchlistButton";
import "./Hero.css";

const ADVANCE_MS = 9000;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Hero({ items, genres = {} }) {
  const featured = (items || []).filter((i) => i.backdrop_path).slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const toast = useToast();
  const item = featured[index];

  useEffect(() => {
    if (paused || featured.length < 2 || reducedMotion()) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % featured.length), ADVANCE_MS);
    return () => clearTimeout(t);
  }, [index, paused, featured.length]);

  if (!item) return <HeroSkeleton />;

  const playTrailer = async () => {
    setLoadingTrailer(true);
    try {
      const video = trailerOf(await tmdb.details("movie", item.id));
      if (video) setTrailer(video);
      else toast("No trailer is available for this title yet.");
    } catch {
      toast("Couldn’t load the trailer. Try again in a moment.", "error");
    } finally {
      setLoadingTrailer(false);
    }
  };

  const genreNames = (item.genre_ids || []).map((g) => genres[g]).filter(Boolean).slice(0, 2);
  const rating = ratingOf(item);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured this week"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero__media" aria-hidden="true">
        {featured.map((f, i) => (
          <img
            key={f.id}
            className={i === index ? "is-active" : ""}
            src={image(f.backdrop_path, "w1280")}
            srcSet={`${image(f.backdrop_path, "w780")} 780w, ${image(f.backdrop_path, "w1280")} 1280w, ${image(f.backdrop_path, "original")} 1920w`}
            sizes="100vw"
            alt=""
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="hero__content" key={item.id}>
        <div className="hero__stickers" aria-hidden="true">
          <span className="sticker hero__sticker" key={item.id}>
            <span>
              New
              <br />
              this
              <br />
              week
            </span>
          </span>
        </div>
        <p className="visually-hidden">Trending this week</p>
        <h1 className="display hero__title">{titleOf(item)}</h1>
        <p className="meta hero__meta">
          {yearOf(item) && <span>{yearOf(item)}</span>}
          {genreNames.length > 0 && <span>{genreNames.join(", ")}</span>}
          {rating && (
            <span className="rating">
              <Star size={14} fill="currentColor" aria-hidden="true" /> {rating}
            </span>
          )}
        </p>
        {item.overview && <p className="hero__overview">{item.overview}</p>}
        <div className="hero__actions">
          <button type="button" className="btn btn-primary" onClick={playTrailer} disabled={loadingTrailer}>
            <Play size={18} fill="currentColor" aria-hidden="true" />
            {loadingTrailer ? "Loading…" : "Play trailer"}
          </button>
          <WatchlistButton item={item} />
          <Link to={pathOf(item)} className="btn btn-ghost">
            <Info size={18} aria-hidden="true" /> Details
          </Link>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="hero__picker" role="group" aria-label="Choose featured title">
          {featured.map((f, i) => (
            <button
              key={f.id}
              type="button"
              aria-label={`Show ${titleOf(f)}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={i === index ? "is-active" : ""}
            >
              <img src={image(f.backdrop_path, "w300")} alt="" loading="lazy" />
              <span className="hero__progress" style={{ animationPlayState: paused ? "paused" : "running" }} />
              <span className="hero__spine">{titleOf(f)}</span>
            </button>
          ))}
        </div>
      )}

      <TrailerDialog video={trailer} title={titleOf(item)} onClose={() => setTrailer(null)} />
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="hero hero--loading" aria-busy="true" aria-label="Loading featured titles">
      <div className="hero__content">
        <div className="skeleton" style={{ height: 14, width: 140 }} />
        <div className="skeleton" style={{ height: 72, width: "min(560px, 80vw)", marginTop: 16 }} />
        <div className="skeleton" style={{ height: 16, width: "min(440px, 70vw)", marginTop: 20 }} />
        <div className="skeleton" style={{ height: 16, width: "min(380px, 60vw)", marginTop: 10 }} />
        <div className="skeleton" style={{ height: 44, width: 300, marginTop: 28 }} />
      </div>
    </section>
  );
}
