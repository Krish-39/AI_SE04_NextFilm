import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchX, Sparkles } from "lucide-react";

import PosterGrid from "../components/PosterGrid";
import StateMessage from "../components/StateMessage";
import { getMovieRecommendations } from "../services/gemini";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { tmdb } from "../lib/tmdb";
import "./Search.css";

// Short queries are probably titles; longer ones read like descriptions.
const looksLikeDescription = (q) => q.trim().split(/\s+/).length > 3;

async function aiSearch(q) {
  const titles = await getMovieRecommendations(q);
  const found = await Promise.all(titles.map((t) => tmdb.findMovie(t).catch(() => null)));
  return found.filter(Boolean);
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const ai = params.get("ai") === "1" || (params.get("ai") !== "0" && looksLikeDescription(q));
  const [attempt, setAttempt] = useState(0);
  useDocumentTitle(q ? `“${q}”` : "Search");

  const { data, error, loading } = useAsync(
    () => (q ? (ai ? aiSearch(q) : tmdb.search(q)) : Promise.resolve([])),
    [q, ai, attempt],
  );

  const run = (text, mode) => {
    const next = text.trim();
    if (!next) return;
    setParams({ q: next, ai: mode });
  };

  return (
    <main id="main" className="page search-page">
      <SearchForm key={q} initial={q} onSearch={(text) => run(text, looksLikeDescription(text) ? "1" : "0")} />

      {q && (
        <div className="search-page__head">
          <h1 className="search-page__title">
            {ai ? (
              <>
                <Sparkles size={20} aria-hidden="true" className="search-page__ai-icon" /> AI picks for “{q}”
              </>
            ) : (
              <>Results for “{q}”</>
            )}
          </h1>
          <button type="button" className="btn btn-ghost" onClick={() => run(q, ai ? "0" : "1")}>
            {ai ? "Search titles instead" : "Ask NextFilm AI instead"}
          </button>
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
          title={ai ? "NextFilm AI isn’t available right now" : "Search failed"}
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
            ? "The recommendation service didn’t respond. You can still search by title."
            : "Check your connection and try again."}
        </StateMessage>
      )}

      {q && !error && (loading || data?.length > 0) && (
        <PosterGrid items={data || []} loading={loading} count={ai ? 5 : 12} />
      )}

      {q && !error && !loading && data?.length === 0 && (
        <StateMessage
          icon={SearchX}
          title="Nothing matched"
          action={
            <Link to="/" className="btn btn-secondary">
              Browse what’s trending
            </Link>
          }
        >
          Try a different spelling, or describe it instead: “a heist film set in Paris”.
        </StateMessage>
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
