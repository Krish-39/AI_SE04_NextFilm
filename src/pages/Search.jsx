import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, SearchX, SlidersHorizontal, Sparkles, X } from "lucide-react";

import FilterPanel from "../components/FilterPanel";
import PosterGrid from "../components/PosterGrid";
import RedditIcon from "../components/RedditIcon";
import StateMessage from "../components/StateMessage";
import Tabs from "../components/Tabs";
import { getRecommendations } from "../services/gemini";
import { genreName } from "../lib/filters";
import { moodSearch, parseRequest } from "../lib/moodSearch";
import { communityPicks } from "../lib/reddit";
import {
  applySearchFilters,
  clearSearchFilters,
  describeSearchFilters,
  parseSearchFilters,
  SEARCH_SORTS,
  searchFilterCount,
  writeSearchFilters,
} from "../lib/searchFilters";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { tmdb } from "../lib/tmdb";
import "./Browse.css";
import "./Search.css";

// Short queries are probably titles; longer ones read like descriptions.
const looksLikeDescription = (q) => q.trim().split(/\s+/).length > 3;

const key = (i) => `${i.media_type === "tv" ? "tv" : "movie"}-${i.id}`;

function dedupe(items, skip = new Set()) {
  const seen = new Set(skip);
  return items.filter((i) => i && !seen.has(key(i)) && seen.add(key(i)));
}

async function aiPicks(q) {
  const titles = await getRecommendations(q);
  const found = await Promise.all(titles.map((t) => tmdb.findTitle(t).catch(() => null)));
  return dedupe(found).map((i) => ({ ...i, fromAi: true }));
}

// Reddit names titles as plain text; keep only exact TMDB matches.
async function redditPicks(q, kind) {
  const { picks = [], threads = [] } = await communityPicks(q, kind);
  const matched = await Promise.all(
    picks.map((p) =>
      tmdb
        .matchTitle(p.title, p.year)
        .then((item) => item && { ...item, reddit: { mentions: p.mentions, votes: p.votes, threads: p.threads } })
        .catch(() => null),
    ),
  );
  return { items: dedupe(matched), threads };
}

async function describeSearch(q) {
  const { parsed, items } = await moodSearch(q, { tmdb });
  // Nothing understood: treat it as a title after all.
  return { parsed, items: items.length ? items : await tmdb.search(q), understood: items.length > 0 };
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const mode = params.get("mode");
  const describe = mode ? mode === "describe" : looksLikeDescription(q);
  const filters = useMemo(() => parseSearchFilters(params), [params]);
  const sheet = useRef(null);
  const [attempt, setAttempt] = useState(0);
  useDocumentTitle(q ? `“${q}”` : "Search");

  const kindHint = filters.type === "tv" ? "tv" : filters.type === "movie" ? "movie" : parseRequest(q).type;

  const titles = useAsync(() => (q && !describe ? tmdb.search(q) : null), [q, describe, attempt]);
  const mood = useAsync(() => (q && describe ? describeSearch(q) : null), [q, describe, attempt]);
  const ai = useAsync(() => (q && describe ? aiPicks(q) : null), [q, describe, attempt]);
  const reddit = useAsync(() => (q && describe ? redditPicks(q, kindHint) : null), [q, describe, kindHint, attempt]);

  const redditItems = useMemo(() => reddit.data?.items || [], [reddit.data]);
  const moreItems = useMemo(() => {
    if (!describe) return titles.data || [];
    const skip = new Set(redditItems.map(key));
    return dedupe([...(ai.data || []), ...(mood.data?.items || [])], skip);
  }, [describe, titles.data, ai.data, mood.data, redditItems]);

  const noType = { ...filters, type: "all" };
  const counts = (list) => {
    const kept = applySearchFilters(list, noType);
    return { all: kept.length, movie: kept.filter((i) => i.media_type !== "tv").length, tv: kept.filter((i) => i.media_type === "tv").length };
  };
  const c1 = counts(moreItems);
  const c2 = counts(redditItems);
  const tabCounts = { all: c1.all + c2.all, movie: c1.movie + c2.movie, tv: c1.tv + c2.tv };

  const shownMore = applySearchFilters(moreItems, filters);
  const shownReddit = applySearchFilters(redditItems, filters);

  const setFilters = (next) => setParams(writeSearchFilters(params, next), { replace: true });
  const run = (text, nextMode) => {
    const next = text.trim();
    if (!next) return;
    const out = new URLSearchParams({ q: next });
    if (nextMode) out.set("mode", nextMode);
    setParams(writeSearchFilters(out, filters));
  };

  const chips = describeSearchFilters(filters);
  const filterCount = searchFilterCount(filters);
  const mainLoading = describe ? mood.loading : titles.loading;
  const mainError = describe ? mood.error : titles.error;
  const anyFiltered = filterCount > 0 || filters.type !== "all";
  const total = shownMore.length + shownReddit.length;

  const panel = <FilterPanel filters={{ ...filters, runtime: "", providers: [] }} onChange={setFilters} showRuntime={false} showProviders={false} />;

  return (
    <main id="main" className="page search-page">
      <SearchForm key={q} initial={q} onSearch={(text) => run(text, null)} />

      {!q && (
        <StateMessage title="Search films and series">
          Type a title, or describe what you’re in the mood for: “a sad space movie”, “funny Korean series from the 2010s”.
        </StateMessage>
      )}

      {q && (
        <>
          <div className="search-page__head">
            <h1 className="search-page__title">
              {describe ? (
                <>
                  <Sparkles size={20} aria-hidden="true" className="search-page__ai-icon" /> Picks for “{q}”
                </>
              ) : (
                <>Titles matching “{q}”</>
              )}
            </h1>
            <button type="button" className="btn btn-ghost" onClick={() => run(q, describe ? "titles" : "describe")}>
              {describe ? "Search titles instead" : "Treat it as a description"}
            </button>
          </div>

          {describe && mood.data?.understood && <Understood parsed={mood.data.parsed} />}

          <div className="browse__layout search-page__layout">
            <aside className="browse__sidebar" aria-label="Filters">
              {panel}
            </aside>

            <section className="browse__results" aria-live="polite" aria-busy={mainLoading}>
              <div className="browse__toolbar search-page__toolbar">
                <button type="button" className="btn btn-secondary browse__filters-btn" onClick={() => sheet.current?.showModal()}>
                  <SlidersHorizontal size={18} aria-hidden="true" /> Filters
                  {filterCount > 0 && <span className="badge">{filterCount}</span>}
                </button>
                <Tabs
                  label="Show"
                  value={filters.type}
                  onChange={(v) => setFilters({ ...filters, type: v })}
                  options={[
                    ["all", "All", tabCounts.all],
                    ["movie", "Films", tabCounts.movie],
                    ["tv", "Series", tabCounts.tv],
                  ]}
                />
                <label className="browse__sort">
                  <span className="visually-hidden">Sort by</span>
                  <select className="select" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                    {SEARCH_SORTS.map(([value, label]) => (
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
                      <button type="button" onClick={() => setFilters(chip.next)}>
                        {chip.label} <X size={14} aria-hidden="true" />
                        <span className="visually-hidden">Remove filter</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" className="active-filters__clear" onClick={() => setFilters(clearSearchFilters(filters))}>
                      Clear all
                    </button>
                  </li>
                </ul>
              )}

              {describe && (
                <RedditSection
                  state={reddit}
                  items={shownReddit}
                  hiddenByFilters={redditItems.length > 0 && shownReddit.length === 0}
                />
              )}

              {describe && (
                <h2 className="section-title tape search-page__section">{redditItems.length ? "More matches" : "Matches"}</h2>
              )}

              {mainError ? (
                <StateMessage
                  icon={SearchX}
                  title="Search failed"
                  action={
                    <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
                      Try again
                    </button>
                  }
                >
                  Check your connection and try again.
                </StateMessage>
              ) : mainLoading || shownMore.length > 0 ? (
                <PosterGrid
                  items={shownMore}
                  loading={mainLoading}
                  count={12}
                  showKind
                  renderBadge={(item) =>
                    item.fromAi && (
                      <span className="poster-badge poster-badge--ai">
                        <Sparkles size={11} aria-hidden="true" /> Clerk’s pick
                      </span>
                    )
                  }
                />
              ) : moreItems.length > 0 ? (
                <StateMessage
                  title="Nothing left with these filters"
                  action={
                    <button type="button" className="btn btn-secondary" onClick={() => setFilters({ ...clearSearchFilters(filters), type: "all" })}>
                      Clear filters
                    </button>
                  }
                >
                  {total === 0 ? "Try removing a filter." : "The Reddit picks above still match."}
                </StateMessage>
              ) : (
                <StateMessage
                  icon={SearchX}
                  title="Nothing matched"
                  action={
                    <Link to="/browse" className="btn btn-secondary">
                      Browse with filters
                    </Link>
                  }
                >
                  {describe
                    ? "Try other words: a mood, a genre, a decade or a language, like “tense crime series from the 90s”."
                    : "Check the spelling, or describe it instead: “a heist film set in Paris”."}
                </StateMessage>
              )}

              {describe && reddit.data?.threads?.length > 0 && <Threads threads={reddit.data.threads} />}
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
              <button type="button" className="btn btn-ghost" onClick={() => setFilters(clearSearchFilters(filters))} disabled={!anyFiltered}>
                Clear all
              </button>
              <button type="button" className="btn btn-primary" onClick={() => sheet.current.close()}>
                Show {total} {total === 1 ? "result" : "results"}
              </button>
            </div>
          </dialog>
        </>
      )}
    </main>
  );
}

function Understood({ parsed }) {
  const parts = [
    parsed.type === "tv" ? "Series" : "Films",
    ...parsed.genres.map((g) => genreName(parsed.type, g)).filter(Boolean),
    ...parsed.keywords.map((k) => `“${k}”`),
    parsed.from && parsed.to ? (parsed.from === parsed.to ? `${parsed.from}` : `${parsed.from}–${parsed.to}`) : parsed.from ? `from ${parsed.from}` : parsed.to ? `up to ${parsed.to}` : null,
    parsed.rating && `rated ${parsed.rating}+`,
  ].filter(Boolean);
  return (
    <p className="search-page__understood">
      <span>Looking for</span> {parts.join(" · ")}
    </p>
  );
}

function RedditSection({ state, items, hiddenByFilters }) {
  return (
    <section className="reddit-picks" aria-labelledby="reddit-picks-title">
      <h2 className="section-title tape" id="reddit-picks-title">
        <RedditIcon size={14} /> Recommended on Reddit
      </h2>
      <p className="reddit-picks__lede">
        What real people suggested most in Reddit threads asking for the same thing, counted from their upvoted replies.
      </p>
      {state.loading ? (
        <PosterGrid items={[]} loading count={6} />
      ) : state.error ? (
        <p className="reddit-picks__note">Reddit picks aren’t available right now. The matches below still work.</p>
      ) : hiddenByFilters ? (
        <p className="reddit-picks__note">None of the Reddit picks match your filters.</p>
      ) : items.length === 0 ? (
        <p className="reddit-picks__note">No Reddit threads asked for quite this. Try fewer, broader words.</p>
      ) : (
        <PosterGrid
          items={items}
          count={6}
          showKind
          renderBadge={(item) => (
            <span
              className="poster-badge poster-badge--reddit"
              title={`${item.reddit.mentions} ${item.reddit.mentions === 1 ? "person" : "people"} recommended it · ${item.reddit.votes.toLocaleString()} upvotes`}
            >
              <RedditIcon size={11} /> {item.reddit.mentions} {item.reddit.mentions === 1 ? "rec" : "recs"}
            </span>
          )}
        />
      )}
    </section>
  );
}

function Threads({ threads }) {
  return (
    <section className="staff-picks" aria-labelledby="threads-title">
      <h2 className="section-title tape" id="threads-title">
        Threads we read
      </h2>
      <p className="staff-picks__lede">The Reddit discussions these picks came from. Tap a card to read them.</p>
      <ul className="staff-picks__list">
        {threads.map((t, i) => (
          <li key={t.id} style={{ "--rot": `${[-1.4, 0.9, -0.5][i % 3]}deg` }}>
            <a href={t.permalink} target="_blank" rel="noreferrer" className="index-card staff-card">
              <span className="hand staff-card__note">“{t.title}”</span>
              <span className="staff-card__by">
                <RedditIcon size={12} /> r/{t.subreddit} · {t.score.toLocaleString()} upvotes · {t.comments.toLocaleString()} comments
              </span>
              <ExternalLink size={14} aria-hidden="true" className="staff-card__out" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchForm({ initial, onSearch }) {
  const [draft, setDraft] = useState(initial);
  return (
    <form
      className="search-page__form"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(draft);
      }}
    >
      <label htmlFor="search-input" className="visually-hidden">
        Search titles or describe what you want
      </label>
      <input
        id="search-input"
        className="input search-page__input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="A title, or a mood: “a sad space movie”"
        autoComplete="off"
        maxLength={500}
      />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
