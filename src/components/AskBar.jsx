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
        <h2 className="section-title" id="ask-title">
          Not sure what to watch?
        </h2>
        <p className="ask__lede">Describe the mood, a plot, or a film you loved. NextFilm AI picks five.</p>
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
            placeholder="e.g. a heist movie set in Europe with great music"
            maxLength={500}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary ask__submit" disabled={!prompt.trim()}>
            Find films <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
        <ul className="ask__examples" aria-label="Example prompts">
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
