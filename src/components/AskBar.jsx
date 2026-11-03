import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { LANGUAGES } from "../lib/filters";
import { writeSearchFilters } from "../lib/searchFilters";
import "./AskBar.css";

const KINDS = [
  ["all", "Either"],
  ["movie", "Films"],
  ["tv", "Series"],
];

const ERAS = [
  ["", "Any time", null, null],
  ["2020s", "2020s", 2020, null],
  ["2010s", "2010s", 2010, 2019],
  ["2000s", "2000s", 2000, 2009],
  ["90s", "90s", 1990, 1999],
  ["older", "Before 1990", null, 1989],
];

const EXAMPLES = [
  "A slow, beautiful space movie",
  "Something funny for a rainy Sunday",
  "A thriller with a twist I won’t see coming",
  "Feel-good films like Paddington",
];

export default function AskBar() {
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState("all");
  const [era, setEra] = useState("");
  const [lang, setLang] = useState("");
  const [rated, setRated] = useState(false);
  const navigate = useNavigate();

  // The choices become the search page's filters, so the clerk's whole
  // pipeline (TMDB, AI and Reddit picks) respects them.
  const go = (text) => {
    const q = text.trim();
    if (!q) return;
    const [, , from, to] = ERAS.find(([v]) => v === era);
    const params = writeSearchFilters(new URLSearchParams({ q, mode: "describe" }), {
      type: kind,
      genres: [],
      from,
      to,
      rating: rated ? "7" : "",
      lang,
      sort: "best",
    });
    navigate(`/search?${params}`);
  };

  return (
    <section className="ask" aria-labelledby="ask-title">
      <div className="ask__inner">
        <div className="ask__clerk">
          <h2 className="section-title tape" id="ask-title">
            Ask the clerk
          </h2>
          <p className="ask__lede">
            Tell me what kind of night it is. I’ll check what the regulars on Reddit recommend, pull matching tapes from the
            shelves and stick to what you pick below.
          </p>
        </div>
        <form
          className="ask__form"
          onSubmit={(e) => {
            e.preventDefault();
            go(prompt);
          }}
        >
          <label className="visually-hidden" htmlFor="ask-input">
            Describe what you want to watch
          </label>
          <input
            id="ask-input"
            className="input ask__input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Something like Arrival, but cosier…"
            maxLength={500}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary ask__submit" disabled={!prompt.trim()}>
            Ask <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
        <fieldset className="ask__options">
          <legend className="visually-hidden">Narrow it down</legend>
          <div className="segmented ask__kind" role="radiogroup" aria-label="Films or series">
            {KINDS.map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={kind === value} onClick={() => setKind(value)}>
                {label}
              </button>
            ))}
          </div>
          <label className="ask__option">
            <span>When</span>
            <select className="select" value={era} onChange={(e) => setEra(e.target.value)}>
              {ERAS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="ask__option">
            <span>Language</span>
            <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGUAGES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="ask__check">
            <input type="checkbox" checked={rated} onChange={(e) => setRated(e.target.checked)} />
            <span>Only well rated (7+)</span>
          </label>
        </fieldset>
        <p className="ask__try" id="ask-try">
          Or try one of these:
        </p>
        <ul className="ask__examples" aria-labelledby="ask-try">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button type="button" onClick={() => go(ex)}>
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
