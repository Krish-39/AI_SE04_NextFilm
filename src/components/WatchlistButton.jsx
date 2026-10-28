import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { useAuth, useToast, useWatchlist } from "../lib/contexts";
import { titleOf } from "../lib/tmdb";

export default function WatchlistButton({ item, compact = false }) {
  const { user } = useAuth();
  const watchlist = useWatchlist();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const saved = Boolean(user && watchlist.has(item));

  const toggle = async () => {
    if (!user) {
      toast("Sign in to save titles to your watchlist");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await watchlist.remove(item);
        toast(`Removed “${titleOf(item)}” from your watchlist`);
      } else {
        await watchlist.add(item);
        toast(`Saved “${titleOf(item)}” to your watchlist`, "success");
      }
    } catch {
      toast("Couldn’t update your watchlist. Check your connection and try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      className="btn btn-secondary"
      aria-pressed={saved}
      onClick={toggle}
      disabled={busy}
    >
      <Icon size={18} aria-hidden="true" />
      {compact ? <span className="visually-hidden">Watchlist</span> : saved ? "In watchlist" : "Watchlist"}
    </button>
  );
}
