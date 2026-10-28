import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Bookmark, Compass, LogIn, LogOut, Search, X } from "lucide-react";

import { auth } from "../firebase";
import { useAuth, useToast } from "../lib/contexts";
import Logo from "./Logo";
import "./SiteHeader.css";

export default function SiteHeader() {
  const { user, ready } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  // Panels remember which page they were opened on, so navigating closes them.
  const [searchAt, setSearchAt] = useState(null);
  const [menuAt, setMenuAt] = useState(null);
  const searchOpen = searchAt === location.key;
  const menuOpen = menuAt === location.key;
  const setSearchOpen = (open) => setSearchAt(open ? location.key : null);
  const setMenuOpen = (open) => setMenuAt(open ? location.key : null);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuAt(null);
    };
    const esc = (e) => e.key === "Escape" && setMenuAt(null);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menuOpen]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  const logout = async () => {
    await signOut(auth);
    toast("Signed out");
    navigate("/");
  };

  const initial = (user?.displayName || user?.email || "?").trim()[0]?.toUpperCase();

  return (
    <header className={`site-header${scrolled ? " is-solid" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Link to="/" className="site-header__brand">
        <Logo />
      </Link>

      <nav className="site-header__nav" aria-label="Main">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/browse">Browse</NavLink>
        <NavLink to="/watchlist">Watchlist</NavLink>
      </nav>

      <div className="site-header__actions">
        {searchOpen ? (
          <form className="header-search" role="search" onSubmit={submit}>
            <Search size={18} aria-hidden="true" />
            <label className="visually-hidden" htmlFor="header-search">
              Search films and series
            </label>
            <input
              id="header-search"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Titles, or describe a mood…"
              autoComplete="off"
            />
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X size={18} />
            </button>
          </form>
        ) : (
          <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} />
          </button>
        )}

        <Link to="/browse" className="icon-btn site-header__watchlist" aria-label="Browse">
          <Compass size={20} />
        </Link>
        <Link to="/watchlist" className="icon-btn site-header__watchlist" aria-label="Watchlist">
          <Bookmark size={20} />
        </Link>

        {ready && !user && (
          <Link to="/login" className="btn btn-secondary site-header__signin" aria-label="Sign in">
            <LogIn size={18} aria-hidden="true" className="site-header__signin-icon" />
            <span className="site-header__signin-label">Sign in</span>
          </Link>
        )}

        {user && (
          <div className="account" ref={menuRef}>
            <button
              type="button"
              className="account__button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {initial}
            </button>
            {menuOpen && (
              <div className="account__menu" role="menu">
                <p className="account__email">{user.email}</p>
                <Link role="menuitem" to="/watchlist">
                  <Bookmark size={16} aria-hidden="true" /> Your watchlist
                </Link>
                <button role="menuitem" type="button" onClick={logout}>
                  <LogOut size={16} aria-hidden="true" /> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
