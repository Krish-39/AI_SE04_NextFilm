import { Link, useSearchParams } from "react-router-dom";
import { Bookmark, X } from "lucide-react";

import PosterGrid from "../components/PosterGrid";
import StateMessage from "../components/StateMessage";
import Tabs from "../components/Tabs";
import { useToast, useWatchlist } from "../lib/contexts";
import { sortItems, WATCHLIST_SORTS } from "../lib/sortItems";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { titleOf } from "../lib/tmdb";
import "./Watchlist.css";

export default function Watchlist() {
  useDocumentTitle("Your watchlist");
  const { items, status, remove } = useWatchlist();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const type = ["movie", "tv"].includes(params.get("type")) ? params.get("type") : "all";
  const sort = WATCHLIST_SORTS.some(([v]) => v === params.get("sort")) ? params.get("sort") : "added";

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
    } catch {
      toast("Couldn’t remove that title. Try again.", "error");
    }
  };

  const filtered = sortItems(type === "all" ? items : items.filter((i) => i.media_type === type), sort);
  const films = items.filter((i) => i.media_type !== "tv").length;

  return (
    <main id="main" className="page">
      <div className="watchlist__head">
        <h1 className="display watchlist__title">Watchlist</h1>
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
        <StateMessage icon={Bookmark} title="We couldn’t load your watchlist">
          Check your connection and refresh the page.
        </StateMessage>
      )}

      {status === "loading" && <PosterGrid items={[]} loading count={6} />}

      {status === "ready" && items.length === 0 && (
        <StateMessage
          icon={Bookmark}
          title="Nothing saved yet"
          action={
            <Link to="/browse" className="btn btn-primary">
              Find something to watch
            </Link>
          }
        >
          Tap Watchlist on any film or series and it will wait for you here.
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

      {status === "ready" && filtered.length > 0 && (
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
