import { Link } from "react-router-dom";
import { Star } from "lucide-react";

import { image, pathOf, ratingOf, titleOf, yearOf } from "../lib/tmdb";

export default function PosterCard({ item, rank, eager = false }) {
  const title = titleOf(item);
  const year = yearOf(item);
  const rating = ratingOf(item);
  const src = image(item.poster_path, "w342");

  return (
    <article className={`poster-card${rank ? " poster-card--ranked" : ""}`}>
      {rank && (
        <span className="poster-card__rank" aria-hidden="true">
          {rank}
        </span>
      )}
      <Link to={pathOf(item)} className="poster-card__link">
        <div className="poster-card__frame">
          {src ? (
            <img
              src={src}
              srcSet={`${image(item.poster_path, "w185")} 185w, ${src} 342w, ${image(item.poster_path, "w500")} 500w`}
              sizes="(max-width: 640px) 40vw, 200px"
              alt=""
              width="342"
              height="513"
              loading={eager ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <span className="poster-card__fallback">{title}</span>
          )}
        </div>
        <h3 className="poster-card__title">
          {rank && <span className="visually-hidden">Number {rank}: </span>}
          {title}
        </h3>
      </Link>
      <p className="meta poster-card__meta">
        {year && <span>{year}</span>}
        {rating && (
          <span className="rating">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            <span className="visually-hidden">Rated </span>
            {rating}
          </span>
        )}
      </p>
    </article>
  );
}

export function PosterSkeleton() {
  return (
    <div className="poster-card" aria-hidden="true">
      <div className="poster-card__frame skeleton" />
      <div className="skeleton" style={{ height: 14, width: "80%", marginTop: 10 }} />
      <div className="skeleton" style={{ height: 12, width: "45%", marginTop: 8 }} />
    </div>
  );
}
