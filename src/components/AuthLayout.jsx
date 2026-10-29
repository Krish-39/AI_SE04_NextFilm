import { Link } from "react-router-dom";

import { useAsync } from "../lib/useAsync";
import { hasTmdbKey, image, tmdb } from "../lib/tmdb";
import Logo from "./Logo";
import MemberCard from "./MemberCard";
import "./AuthLayout.css";

export default function AuthLayout({ title, subtitle, children, footer, card = {} }) {
  const { data } = useAsync(() => (hasTmdbKey ? tmdb.trending("movie") : []), []);
  const posters = (data || []).filter((m) => m.poster_path).slice(0, 12);

  return (
    <main id="main" className="auth">
      <div className="auth__wall" aria-hidden="true">
        {posters.map((m) => (
          <img key={m.id} src={image(m.poster_path, "w342")} alt="" loading="lazy" />
        ))}
        <MemberCard name={card.name} email={card.email} className="member-card--wall" />
      </div>
      <div className="auth__panel">
        <Link to="/" className="auth__logo">
          <Logo />
        </Link>
        <MemberCard name={card.name} email={card.email} className="member-card--panel" />
        <h1 className="display auth__title">{title}</h1>
        {subtitle && <p className="auth__subtitle">{subtitle}</p>}
        {children}
        {footer && <p className="auth__footer">{footer}</p>}
      </div>
    </main>
  );
}
