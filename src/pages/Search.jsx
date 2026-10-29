import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, SearchX, Sparkles } from "lucide-react";

import PosterGrid from "../components/PosterGrid";
import RedditIcon from "../components/RedditIcon";
import StateMessage from "../components/StateMessage";
import Tabs from "../components/Tabs";
import { getRecommendations } from "../services/gemini";
import { mergePicks, withTimeout } from "../lib/merge";
import { communityThreads } from "../lib/reddit";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { tmdb } from "../lib/tmdb";
import "./Search.css";

// Short queries are probably titles; longer ones read like descriptions.
const looksLikeDescription = (q) => q.trim().split(/\s+/).length > 3;

const resolveTitles = (titles) => Promise.all(titles.map((t) => tmdb.findTitle(t).catch(() => null)));

async function aiSearch(q) {
  // Reddit is a bonus: give it a few seconds, then carry on without it.
  const threads = await withTimeout(communityThreads(q), 3500, []);
  const { titles, community } = await getRecommendations(
    q,
    threads.map((t) => t.title),
  );
  const [picks, communityPicks] = await Promise.all([resolveTitles(titles), resolveTitles(community)]);
  return { items: mergePicks(picks, communityPicks), threads: threads.slice(0, 3) };
}

async function titleSearch(q) {
  return { items: await tmdb.search(q), threads: [] };
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const ai = params.get("ai") === "1" || (params.get("ai") !== "0" && looksLikeDescription(q));
  const type = ["movie", "tv"].includes(params.get("type")) ? params.get("type") : "all";
  const [attempt, setAttempt] = useState(0);
  useDocumentTitle(q ? `“${q}”` : "Search");

  const { data, error, loading } = useAsync(
    () => (q ? (ai ? aiSearch(q) : titleSearch(q)) : Promise.resolve({ items: [], threads: [] })),
    [q, ai, attempt],
  );

  const items = useMemo(() => data?.items || [], [data]);
  const shown = type === "all" ? items : items.filter((i) => i.media_type === type);
  const counts = {
    all: items.length,
    movie: items.filter((i) => i.media_type !== "tv").length,
    tv: items.filter((i) => i.media_type === "tv").length,
  };

  const update = (next) => {
    const merged = { q, ai: ai ? "1" : "0", type, ...next };
    const out = new URLSearchParams({ q: merged.q, ai: merged.ai });
    if (merged.type !== "all") out.set("type", merged.type);
    setParams(out);
  };

  const run = (text, mode) => {
    const next = text.trim();
    if (next) update({ q: next, ai: mode, type: "all" });
  };

  return (
    <main id="main" className="page search-page">
      <SearchForm key={q} initial={q} onSearch={(text) => run(text, looksLikeDescription(text) ? "1" : "0")} />

      {q && (
        <div className="search-page__head">
          <h1 className="search-page__title">
            {ai ? (
              <>
                <Sparkles size={20} aria-hidden="true" className="search-page__ai-icon" /> The clerk’s picks for “{q}”
              </>
            ) : (
              <>Results for “{q}”</>
            )}
          </h1>
          <button type="button" className="btn btn-ghost" onClick={() => run(q, ai ? "0" : "1")}>
            {ai ? "Search titles instead" : "Ask the clerk instead"}
          </button>
        </div>
      )}

      {q && !error && !loading && items.length > 0 && (
        <div className="search-page__filters">
          <Tabs
            label="Show"
            value={type}
            onChange={(v) => update({ type: v })}
            options={[
              ["all", "All", counts.all],
              ["movie", "Films", counts.movie],
              ["tv", "Series", counts.tv],
            ]}
          />
          {ai && items.some((i) => i.fromReddit) && (
            <p className="search-page__legend">
              <span className="poster-badge poster-badge--reddit">
                <RedditIcon size={11} /> Reddit
              </span>
              the regulars on Reddit recommend it too
            </p>
          )}
        </div>
      )}

      {!q && (
        <StateMessage title="Search films and series">
          Type a title, or describe what you’re in the mood for and NextFilm AI will pick five.
        </StateMessage>
      )}

      {q && error && (
        <StateMessage
          icon={SearchX}
          title={ai ? "The clerk’s on a break" : "Search failed"}
          action={
            ai ? (
              <button type="button" className="btn btn-primary" onClick={() => run(q, "0")}>
                Search titles for “{q}”
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
                Try again
              </button>
            )
          }
        >
          {ai
            ? "NextFilm AI didn’t answer this time. You can still look titles up yourself."
            : "Check your connection and try again."}
        </StateMessage>
      )}

      {q && !error && (loading || shown.length > 0) && (
        <PosterGrid
          items={shown}
          loading={loading}
          count={ai ? 6 : 12}
          showKind
          renderBadge={(item) =>
            item.fromReddit && (
              <span className="poster-badge poster-badge--reddit">
                <RedditIcon size={11} /> Reddit
              </span>
            )
          }
        />
      )}

      {q && !error && !loading && items.length > 0 && shown.length === 0 && (
        <StateMessage
          title={`No ${type === "tv" ? "series" : "films"} in these results`}
          action={
            <button type="button" className="btn btn-secondary" onClick={() => update({ type: "all" })}>
              Show all results
            </button>
          }
        />
      )}

      {q && !error && !loading && items.length === 0 && (
        <StateMessage
          icon={SearchX}
          title="Nothing matched"
          action={
            <Link to="/browse" className="btn btn-secondary">
              Browse with filters
            </Link>
          }
        >
          Try a different spelling, or describe it instead: “a heist film set in Paris”.
        </StateMessage>
      )}

      {ai && data?.threads?.length > 0 && (
        <section className="staff-picks" aria-labelledby="threads-title">
          <h2 className="section-title tape" id="threads-title">
            Notes from the regulars
          </h2>
          <p className="staff-picks__lede">The Reddit threads the clerk read before picking. Tap a card to open it.</p>
          <ul className="staff-picks__list">
            {data.threads.map((t, i) => (
              <li key={t.id} style={{ "--rot": `${[-1.4, 0.9, -0.5][i % 3]}deg` }}>
                <a href={t.permalink} target="_blank" rel="noreferrer" className="index-card staff-card">
                  <span className="hand staff-card__note">“{t.title}”</span>
                  <span className="staff-card__by">
                    <RedditIcon size={12} /> r/{t.subreddit} · {t.score.toLocaleString()} upvotes ·{" "}
                    {t.comments.toLocaleString()} comments
                  </span>
                  <ExternalLink size={14} aria-hidden="true" className="staff-card__out" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
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
        placeholder="Search titles, or describe a mood…"
        autoComplete="off"
        maxLength={500}
      />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
