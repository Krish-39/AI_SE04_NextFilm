// The store sign: a little cassette, the name, and a "VIDEO" tag like the
// lettering on an old rental shop.
export default function Logo() {
  return (
    <span className="logo" aria-label="NextFilm Video">
      <svg className="logo-mark" viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
        <rect x="1" y="1" width="26" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="19" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M6 19l2-4h12l2 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span className="logo-word" aria-hidden="true">
        NextFilm
      </span>
      <span className="logo-tag" aria-hidden="true">
        Video
      </span>
    </span>
  );
}
