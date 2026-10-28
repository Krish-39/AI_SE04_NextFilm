import { createContext, useContext } from "react";

export const AuthContext = createContext({ user: null, ready: false });
export const WatchlistContext = createContext(null);
export const ToastContext = createContext(() => {});

export const useAuth = () => useContext(AuthContext);
export const useWatchlist = () => useContext(WatchlistContext);
export const useToast = () => useContext(ToastContext);
