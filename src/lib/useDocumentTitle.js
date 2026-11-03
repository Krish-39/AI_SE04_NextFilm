import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · NextFilm` : "NextFilm · Find something worth watching tonight";
  }, [title]);
}
