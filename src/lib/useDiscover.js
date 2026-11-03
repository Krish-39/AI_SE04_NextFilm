import { useCallback, useEffect, useState } from "react";

import { tmdb } from "./tmdb";

// Loads /discover results for a set of params and appends further pages on demand.
// Results are tagged with the params key that produced them, so changing a filter
// never shows the previous filter's list.
export function useDiscover(kind, params, attempt = 0) {
  const key = JSON.stringify([kind, params, attempt]);
  const [state, setState] = useState({ key: null, items: [], page: 0, pages: 0, total: 0, error: null, loadingMore: false });

  useEffect(() => {
    let active = true;
    tmdb.discover(kind, params, 1).then(
      (r) => active && setState({ key, items: r.results, page: 1, pages: r.pages, total: r.total, error: null, loadingMore: false }),
      (error) => active && setState({ key, items: [], page: 0, pages: 0, total: 0, error, loadingMore: false }),
    );
    return () => {
      active = false;
    };
    // `params` is captured by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = state.key === key ? state : null;

  const loadMore = useCallback(() => {
    if (!current || current.loadingMore || current.page >= current.pages) return;
    setState((s) => ({ ...s, loadingMore: true }));
    tmdb.discover(kind, params, current.page + 1).then(
      (r) =>
        setState((s) => {
          if (s.key !== key) return s;
          const seen = new Set(s.items.map((i) => i.id));
          return { ...s, items: [...s.items, ...r.results.filter((i) => !seen.has(i.id))], page: s.page + 1, loadingMore: false };
        }),
      () => setState((s) => (s.key === key ? { ...s, loadingMore: false, moreError: true } : s)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, key]);

  return {
    loading: !current,
    items: current?.items || [],
    total: current?.total || 0,
    error: current?.error || null,
    hasMore: Boolean(current && current.page < current.pages),
    loadingMore: Boolean(current?.loadingMore),
    moreError: Boolean(current?.moreError),
    loadMore,
  };
}
