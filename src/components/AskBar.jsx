import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import "./AskBar.css";

const EXAMPLES = [
  "A slow, beautiful space movie",
  "Something funny for a rainy Sunday",
  "A thriller with a twist I won’t see coming",
  "Feel-good films like Paddington",
];

export default function AskBar() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const go = (text) => {
    const q = text.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}&ai=1`);
  };

  return (
    <section className="ask" aria-labelledby="ask-title">
      <div className="ask__inner">
        <div className="ask__clerk">
          <h2 className="section-title tape" id="ask-title">
            Ask the clerk
          </h2>
          <p className="ask__lede">
            Tell me what kind of night it is. I’ll pull five tapes and check what the regulars on Reddit are
            recommending too.
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
