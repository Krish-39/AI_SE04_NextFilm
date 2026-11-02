import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Serves /api/* during `npm run dev` with the same handlers Vercel runs in
// production (server/handlers.js), so Reddit and AI work locally too.
function localApi() {
  return {
    name: "nextfilm-local-api",
    configureServer(server) {
      Object.assign(process.env, loadEnv("development", process.cwd(), ""));
      server.middlewares.use("/api", async (req, res, next) => {
        const name = new URL(req.url, "http://localhost").pathname.replace(/^\/+|\/+$/g, "");
        const { routes } = await server.ssrLoadModule("/server/handlers.js");
        if (!routes[name]) return next();
        req.url = `/api${req.url}`;
        return routes[name](req, res);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApi()],
  test: {
    include: ["src/**/*.test.{js,jsx}", "server/**/*.test.js"],
  },
});
