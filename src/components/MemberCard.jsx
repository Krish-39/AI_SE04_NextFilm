// Decorative membership card on the sign-in pages; it fills in as you type.
function memberNumber(seed) {
  let h = 2166136261;
  for (const ch of seed || "nextfilm") h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const n = String((h >>> 0) % 100000000).padStart(8, "0");
  return `${n.slice(0, 4)} ${n.slice(4)}`;
}

export default function MemberCard({ name, email, className = "" }) {
  const display = (name || email?.split("@")[0] || "Your name here").slice(0, 26);
  return (
    <div className={`member-card ${className}`} aria-hidden="true">
      <div className="member-card__band">
        <span>NextFilm Video</span>
        <span>Member</span>
      </div>
      <div className="member-card__body">
        <p className="member-card__label">Member no.</p>
        <p className="member-card__no">{memberNumber(email || name)}</p>
        <p className="member-card__label">Name</p>
        <p className="member-card__name">{display}</p>
        <div className="member-card__sign">
          <span className="member-card__sig">{name || email?.split("@")[0] || ""}</span>
        </div>
        <p className="member-card__fine">Valid at every NextFilm counter · Late fees waived forever</p>
      </div>
    </div>
  );
}
