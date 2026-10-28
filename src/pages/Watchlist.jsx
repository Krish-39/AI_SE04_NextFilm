import { Link } from "react-router-dom";
import { Bookmark, X } from "lucide-react";

import PosterGrid from "../components/PosterGrid";
import StateMessage from "../components/StateMessage";
import { useToast, useWatchlist } from "../lib/contexts";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { titleOf } from "../lib/tmdb";
import "./Watchlist.css";

export default function Watchlist() {
  useDocumentTitle("Your watchlist");
  const { items, status, remove } = useWatchlist();
  const toast = useToast();

  const drop = async (item) => {
    try {
      await remove(item);
      toast(`Removed “${titleOf(item)}”`);
    } catch {
      toast("Couldn’t remove that title. Try again.", "error");
    }
  };

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
            <Link to="/" className="btn btn-primary">
              Find something to watch
            </Link>
          }
        >
          Tap Watchlist on any film or series and it will wait for you here.
        </StateMessage>
      )}

      {status === "ready" && items.length > 0 && (
        <PosterGrid
          items={items}
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
