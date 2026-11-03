import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  watchlistKey,
} from "../services/watchlistService";
import { AuthContext, ToastContext, WatchlistContext } from "./contexts";

function AuthProvider({ children }) {
  const [state, setState] = useState({ user: auth.currentUser, ready: false });
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, ready: true })), []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((message, tone = "neutral") => {
    clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" aria-live="polite" role="status">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

function WatchlistProvider({ user, children }) {
  const uid = user?.uid ?? null;
  const [state, setState] = useState({ uid: null, items: [], status: "idle" });

  useEffect(() => {
    if (!uid) return undefined;
    let active = true;
    getWatchlist(uid).then(
      (items) => active && setState({ uid, items, status: "ready", error: null }),
      (error) => active && setState({ uid, items: [], status: "error", error }),
    );
    return () => {
      active = false;
    };
  }, [uid]);

  // Until the current user's list arrives, show it as loading (or idle when signed out).
  const current = state.uid === uid ? state : { uid, items: [], status: uid ? "loading" : "idle" };
  const keys = useMemo(() => new Set(current.items.map(watchlistKey)), [current.items]);

  const value = useMemo(
    () => ({
      items: current.items,
      status: current.status,
      error: current.error || null,
      has: (item) => keys.has(watchlistKey(item)),
      add: async (item) => {
        const entry = await addToWatchlist(uid, item);
        setState((s) => ({
          ...s,
          items: [entry, ...s.items.filter((i) => watchlistKey(i) !== watchlistKey(entry))],
        }));
      },
      remove: async (item) => {
        await removeFromWatchlist(uid, item);
        setState((s) => ({ ...s, items: s.items.filter((i) => watchlistKey(i) !== watchlistKey(item)) }));
      },
    }),
    [current.items, current.status, current.error, keys, uid],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ user }) => (
          <ToastProvider>
            <WatchlistProvider user={user}>{children}</WatchlistProvider>
          </ToastProvider>
        )}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}
