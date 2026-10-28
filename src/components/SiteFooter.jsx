import { Link } from "react-router-dom";

import Logo from "./Logo";
import "./SiteFooter.css";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <Link to="/" className="site-footer__brand">
          <Logo />
        </Link>
        <nav aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/watchlist">Watchlist</Link>
          <a href="https://github.com/Krish-39/AI_SE04_NextFilm">Source on GitHub</a>
        </nav>
      </div>
      <p className="site-footer__note">
        Film and series data from{" "}
        <a href="https://www.themoviedb.org/" rel="noreferrer">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB. A DA120B student project.
      </p>
    </footer>
  );
}
