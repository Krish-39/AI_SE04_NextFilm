// Calls the site's own /api functions (Vercel in production, the Vite dev
// server locally). They hold the Reddit and Gemini keys, never the browser.
export class ApiError extends Error {
  constructor(status) {
    super(`API ${status}`);
    this.status = status;
  }
}

export async function api(path, params, { timeout = 15000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`/api/${path}?${new URLSearchParams(params)}`, { signal: ctrl.signal });
    if (!res.ok) throw new ApiError(res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
