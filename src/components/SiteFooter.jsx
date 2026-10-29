import { Link } from "react-router-dom";

import Logo from "./Logo";
import "./SiteFooter.css";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Link to="/" className="site-footer__brand">
            <Logo />
          </Link>
          <p className="site-footer__hours">Open late, every night · Be kind, rewind.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/">The counter</Link>
          <Link to="/browse">The aisles</Link>
          <Link to="/watchlist">Your slip</Link>
          <a href="https://github.com/Krish-39/AI_SE04_NextFilm">Source on GitHub</a>
        </nav>
      </div>
      <p className="site-footer__note">
        Film and series data from{" "}
        <a href="https://www.themoviedb.org/" rel="noreferrer">
          TMDB
        </a>
        ; this product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by JustWatch.
        Community picks from Reddit. UI patterns inspired by{" "}
        <a href="https://uiverse.io/elements" rel="noreferrer">
          uiverse.io
        </a>
        . A DA120B student project.
      </p>
    </footer>
  );
}
