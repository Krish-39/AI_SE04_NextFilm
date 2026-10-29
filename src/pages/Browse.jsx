import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Clapperboard, SlidersHorizontal, X } from "lucide-react";

import FilterPanel from "../components/FilterPanel";
import PosterGrid from "../components/PosterGrid";
import StateMessage from "../components/StateMessage";
import {
  activeFilterCount,
  clearFilters,
  describeFilters,
  parseFilters,
  SORTS,
  toDiscoverParams,
  toSearchParams,
} from "../lib/filters";
import { useRegion } from "../lib/region";
import { useAsync } from "../lib/useAsync";
import { useDiscover } from "../lib/useDiscover";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { tmdb } from "../lib/tmdb";
import "./Browse.css";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const region = useRegion();
  const sheet = useRef(null);
  const kindLabel = filters.type === "tv" ? "series" : "films";
  const countLabel = (n) => `${n.toLocaleString()} ${filters.type === "tv" ? "series" : n === 1 ? "film" : "films"}`;
  useDocumentTitle(filters.type === "tv" ? "Browse series" : "Browse films");

  const providerList = useAsync(() => tmdb.providers(filters.type, region).then((list) => list.slice(0, 15)), [filters.type, region]);
  const providerNames = Object.fromEntries((providerList.data || []).map((p) => [p.provider_id, p.provider_name]));

  const discoverParams = useMemo(() => toDiscoverParams(filters, { region }), [filters, region]);
  const [attempt, setAttempt] = useState(0);
  const results = useDiscover(filters.type, discoverParams, attempt);

  const apply = (next) => setParams(toSearchParams(next), { replace: true });
  const switchType = (type) => {
    // Genre ids and runtime don't carry across films and series.
    if (type !== filters.type) apply({ ...clearFilters(filters), type, sort: filters.sort, from: filters.from, to: filters.to, rating: filters.rating, lang: filters.lang });
  };

  const chips = describeFilters(filters, providerNames);
  const count = activeFilterCount(filters);

  const panel = (
    <FilterPanel
      filters={filters}
      onChange={apply}
      providers={providerList.data}
      providersError={providerList.error}
      region={region}
    />
  );

  return (
    <main id="main" className="page browse">
      <div className="browse__head">
        <div>
          <h1 className="display browse__title">The aisles</h1>
          <p className="browse__lede">Every film and series in the shop. Narrow it down, the clerk won’t judge.</p>
        </div>
        <div className="segmented" role="tablist" aria-label="Type">
          {[
            ["movie", "Films"],
            ["tv", "Series"],
          ].map(([type, label]) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={filters.type === type}
              onClick={() => switchType(type)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="browse__layout">
        <aside className="browse__sidebar" aria-label="Filters">
          {panel}
        </aside>

        <section className="browse__results" aria-live="polite" aria-busy={results.loading}>
          <div className="browse__toolbar">
            <button type="button" className="btn btn-secondary browse__filters-btn" onClick={() => sheet.current?.showModal()}>
              <SlidersHorizontal size={18} aria-hidden="true" /> Filters{count > 0 && <span className="badge">{count}</span>}
            </button>
            <p className="browse__count">
              {results.loading ? "Loading…" : countLabel(results.total)}
            </p>
            <label className="browse__sort">
              <span className="visually-hidden">Sort by</span>
              <select className="select" value={filters.sort} onChange={(e) => apply({ ...filters, sort: e.target.value })}>
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <ul className="active-filters" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button type="button" onClick={() => apply(chip.next)}>
                    {chip.label} <X size={14} aria-hidden="true" />
                    <span className="visually-hidden">Remove filter</span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="active-filters__clear" onClick={() => apply(clearFilters(filters))}>
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.error ? (
            <StateMessage
              icon={Clapperboard}
              title="Couldn’t load results"
              action={
                <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
                  Try again
                </button>
              }
            >
              Check your connection and try again.
            </StateMessage>
          ) : !results.loading && results.items.length === 0 ? (
            <StateMessage
              icon={Clapperboard}
              title={`No ${kindLabel} match all of these`}
              action={
                count > 0 && (
                  <button type="button" className="btn btn-primary" onClick={() => apply(clearFilters(filters))}>
                    Clear filters
                  </button>
                )
              }
            >
              Try removing a genre or widening the years.
            </StateMessage>
          ) : (
            <PosterGrid items={results.items} loading={results.loading} count={18} />
          )}

          {results.hasMore && !results.loading && (
            <div className="browse__more">
              <button type="button" className="btn btn-secondary" onClick={results.loadMore} disabled={results.loadingMore}>
                {results.loadingMore ? "Loading…" : `Load more ${kindLabel}`}
              </button>
              {results.moreError && <p className="filter-hint">That didn’t load. Try again.</p>}
            </div>
          )}
        </section>
      </div>

      <dialog
        ref={sheet}
        className="filter-sheet"
        aria-label="Filters"
        onClick={(e) => e.target === sheet.current && sheet.current.close()}
      >
        <div className="filter-sheet__head">
          <h2 className="section-title tape">Filters</h2>
          <button type="button" className="icon-btn" onClick={() => sheet.current.close()} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>
        <div className="filter-sheet__body">{panel}</div>
        <div className="filter-sheet__foot">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => apply(clearFilters(filters))}
            disabled={count === 0}
          >
            Clear all
          </button>
          <button type="button" className="btn btn-primary" onClick={() => sheet.current.close()}>
            {results.loading ? "Show results" : `Show ${countLabel(results.total)}`}
          </button>
        </div>
      </dialog>
    </main>
  );
}
