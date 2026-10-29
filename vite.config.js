import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Reddit blocks browser requests; in development we forward them from
      // the dev server. Production uses the communitySearch Cloud Function.
      "/reddit-api": {
        target: "https://www.reddit.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, ""),
        headers: { "User-Agent": "web:nextfilm-dev:1.0 (local development)" },
      },
    },
  },
  test: {
    include: ["src/**/*.test.{js,jsx}"],
  },
});
