import { Link, useSearchParams } from "react-router-dom";
import { Bookmark, X } from "lucide-react";

import PosterGrid from "../components/PosterGrid";
import StateMessage from "../components/StateMessage";
import Tabs from "../components/Tabs";
import { useAuth, useToast, useWatchlist } from "../lib/contexts";
import { watchlistErrorMessage } from "../lib/firestoreError";
import { sortItems, WATCHLIST_SORTS } from "../lib/sortItems";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { image, pathOf, ratingOf, titleOf, yearOf } from "../lib/tmdb";
import "./Watchlist.css";

export default function Watchlist() {
  useDocumentTitle("Your watchlist");
  const { items, status, error, remove } = useWatchlist();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const type = ["movie", "tv"].includes(params.get("type")) ? params.get("type") : "all";
  const sort = WATCHLIST_SORTS.some(([v]) => v === params.get("sort")) ? params.get("sort") : "added";
  const view = params.get("view") === "shelf" ? "shelf" : "slip";
  const { user } = useAuth();

  const set = (key, value, fallback) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const drop = async (item) => {
    try {
      await remove(item);
      toast(`Removed “${titleOf(item)}”`);
    } catch (error) {
      toast(watchlistErrorMessage(error, "remove that"), "error");
    }
  };

  const filtered = sortItems(type === "all" ? items : items.filter((i) => i.media_type === type), sort);
  const films = items.filter((i) => i.media_type !== "tv").length;

  return (
    <main id="main" className="page">
      <div className="watchlist__head">
        <h1 className="display watchlist__title">Your slip</h1>
        {status === "ready" && items.length > 0 && (
          <p className="watchlist__count">
            {items.length} title{items.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {status === "ready" && items.length > 0 && (
        <div className="watchlist__toolbar">
          <Tabs
            label="Show"
            value={type}
            onChange={(v) => set("type", v, "all")}
            options={[
              ["all", "All", items.length],
              ["movie", "Films", films],
              ["tv", "Series", items.length - films],
            ]}
          />
          <Tabs
            label="View"
            value={view}
            onChange={(v) => set("view", v, "slip")}
            options={[
              ["slip", "Slip"],
              ["shelf", "Shelf"],
            ]}
          />
          <label className="watchlist__sort">
            <span className="visually-hidden">Sort by</span>
            <select className="select" value={sort} onChange={(e) => set("sort", e.target.value, "added")}>
              {WATCHLIST_SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {status === "error" && (
        <StateMessage icon={Bookmark} title="We couldn’t load your slip">
          {watchlistErrorMessage(error, "load your watchlist")}
        </StateMessage>
      )}

      {status === "loading" && <PosterGrid items={[]} loading count={6} />}

      {status === "ready" && items.length === 0 && (
        <StateMessage
          icon={Bookmark}
          title="Your slip is empty"
          action={
            <Link to="/browse" className="btn btn-primary">
              Find something to watch
            </Link>
          }
        >
          Tap Watchlist on any film or series and the clerk will put it aside for you here.
        </StateMessage>
      )}

      {status === "ready" && items.length > 0 && filtered.length === 0 && (
        <StateMessage
          title={`No ${type === "tv" ? "series" : "films"} saved yet`}
          action={
            <Link to={`/browse${type === "tv" ? "?type=tv" : ""}`} className="btn btn-secondary">
              Browse {type === "tv" ? "series" : "films"}
            </Link>
          }
        />
      )}

      {status === "ready" && filtered.length > 0 && view === "slip" && (
        <RentalSlip items={filtered} email={user?.email} onRemove={drop} />
      )}

      {status === "ready" && filtered.length > 0 && view === "shelf" && (
        <PosterGrid
          items={filtered}
          showKind
          renderExtra={(item) => (
            <button type="button" className="watchlist__remove" onClick={() => drop(item)}>
              <X size={14} aria-hidden="true" /> Remove
              <span className="visually-hidden"> {titleOf(item)}</span>
            </button>
          )}
        />
      )}
    </main>
  );
}

export function RentalSlip({ items, email, onRemove }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <div className="receipt slip">
      <div className="slip__head">
        <p className="slip__store">NextFilm Video</p>
        <p>Rental slip · {today}</p>
        {email && <p>Member: {email}</p>}
      </div>
      <hr />
      <ol className="slip__lines">
        {items.map((item, i) => (
          <li key={`${item.media_type}-${item.id}`}>
            <span className="slip__no">{String(i + 1).padStart(2, "0")}</span>
            {item.poster_path ? (
              <img src={image(item.poster_path, "w92")} alt="" width="40" height="60" loading="lazy" />
            ) : (
              <span className="slip__noimg" aria-hidden="true" />
            )}
            <span className="slip__item">
              <Link to={pathOf(item)}>{titleOf(item)}</Link>
              <span className="slip__detail">
                {[yearOf(item), item.media_type === "tv" ? "Series" : "Film", ratingOf(item) && `★ ${ratingOf(item)}`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <button type="button" className="slip__remove" onClick={() => onRemove(item)}>
              <X size={14} aria-hidden="true" />
              <span className="visually-hidden">Remove {titleOf(item)}</span>
            </button>
          </li>
        ))}
      </ol>
      <hr />
      <div className="slip__total">
        <span>Total</span>
        <span>
          {items.length} title{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="slip__total">
        <span>Due back</span>
        <span>Whenever</span>
      </div>
      <hr />
      <p className="slip__thanks">Thank you. Be kind, rewind.</p>
      <div className="slip__barcode" aria-hidden="true" />
    </div>
  );
}
