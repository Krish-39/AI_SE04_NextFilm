import { Link } from "react-router-dom";

import { useAsync } from "../lib/useAsync";
import { hasTmdbKey, image, tmdb } from "../lib/tmdb";
import Logo from "./Logo";
import "./AuthLayout.css";

export default function AuthLayout({ title, subtitle, children, footer }) {
  const { data } = useAsync(() => (hasTmdbKey ? tmdb.trending("movie") : []), []);
  const posters = (data || []).filter((m) => m.poster_path).slice(0, 12);

  return (
    <main id="main" className="auth">
      <div className="auth__wall" aria-hidden="true">
        {posters.map((m) => (
          <img key={m.id} src={image(m.poster_path, "w342")} alt="" loading="lazy" />
        ))}
      </div>
      <div className="auth__panel">
        <Link to="/" className="auth__logo">
          <Logo />
        </Link>
        <h1 className="display auth__title">{title}</h1>
        {subtitle && <p className="auth__subtitle">{subtitle}</p>}
        {children}
        {footer && <p className="auth__footer">{footer}</p>}
      </div>
    </main>
  );
}
