export default function Logo() {
  return (
    <span className="logo" aria-label="NextFilm">
      <svg className="logo-mark" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 8.5v7l6-3.5z" fill="currentColor" />
      </svg>
      <span className="logo-word" aria-hidden="true">
        Next<span>Film</span>
      </span>
    </span>
  );
}
