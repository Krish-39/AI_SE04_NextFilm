import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import PosterCard, { PosterSkeleton } from "./PosterCard";
import "./Rail.css";

export default function Rail({ id, title, items, loading, error, ranked = false, onRetry, href, subtitle, renderBadge }) {
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };

  useEffect(update, [items]);

  const page = (dir) => {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const headingId = `${id}-title`;
  const list = ranked ? items?.slice(0, 10) : items;

  return (
    <section className="rail" id={id} aria-labelledby={headingId}>
      <div className="rail__head">
        <div className="rail__heading">
          <h2 className={`section-title tape${title.length % 2 ? " tape--tilt-r" : ""}`} id={headingId}>
            {title}
          </h2>
          {subtitle && <p className="rail__subtitle">{subtitle}</p>}
        </div>
        <div className="rail__controls">
          {href && (
            <Link to={href} className="rail__all">
              See all<span className="visually-hidden"> {title}</span>
            </Link>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label={`Scroll ${title} back`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label={`Scroll ${title} forward`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="rail__error">
          <p>Couldn’t load {title.toLowerCase()}.</p>
          {onRetry && (
            <button type="button" className="btn btn-ghost" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      ) : (
        <div className="rail__track" ref={scroller} onScroll={update}>
          {loading || !list
            ? Array.from({ length: 8 }, (_, i) => <PosterSkeleton key={i} />)
            : list.map((item, i) => (
                <PosterCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  rank={ranked ? i + 1 : undefined}
                  badge={renderBadge?.(item)}
                />
              ))}
        </div>
      )}
    </section>
  );
}
