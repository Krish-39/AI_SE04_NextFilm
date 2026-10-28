import PosterCard, { PosterSkeleton } from "./PosterCard";
import "./PosterGrid.css";

export default function PosterGrid({ items, loading, count = 12, renderExtra }) {
  return (
    <ul className="poster-grid">
      {loading
        ? Array.from({ length: count }, (_, i) => (
            <li key={i}>
              <PosterSkeleton />
            </li>
          ))
        : items.map((item, i) => (
            <li key={`${item.media_type}-${item.id}`}>
              <PosterCard item={item} eager={i < 6} />
              {renderExtra?.(item)}
            </li>
          ))}
    </ul>
  );
}
