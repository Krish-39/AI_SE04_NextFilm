// Loading state: a cassette rewinding.
export default function Reels({ label = "Rewinding…" }) {
  return (
    <span className="reels" role="status">
      <span className="reels__tape" aria-hidden="true">
        <span className="reels__reel" />
        <span className="reels__reel" />
      </span>
      {label}
    </span>
  );
}
