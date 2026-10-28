import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import "./TrailerDialog.css";

export default function TrailerDialog({ video, title, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (video && dialog && !dialog.open) dialog.showModal();
  }, [video]);

  if (!video) return null;

  return (
    <dialog
      ref={ref}
      className="trailer"
      aria-label={`${title} trailer`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
    >
      <div className="trailer__bar">
        <p>{video.name || `${title} — trailer`}</p>
        <button type="button" className="icon-btn" onClick={() => ref.current.close()} aria-label="Close trailer">
          <X size={20} />
        </button>
      </div>
      <div className="trailer__frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </dialog>
  );
}
