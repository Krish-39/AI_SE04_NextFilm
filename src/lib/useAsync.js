import { useEffect, useState } from "react";

// Runs an async loader whenever `deps` (primitives) change and reports
// { data, error, loading }. A result is only shown for the deps that
// produced it, so stale responses never flash on screen.
export function useAsync(loader, deps) {
  const key = JSON.stringify(deps);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(loader)
      .then(
        (data) => active && setResult({ key, data, error: null }),
        (error) => active && setResult({ key, data: null, error }),
      );
    return () => {
      active = false;
    };
    // `loader` is recreated every render; `key` captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = result.key !== key;
  return { data: loading ? null : result.data, error: loading ? null : result.error, loading };
}
