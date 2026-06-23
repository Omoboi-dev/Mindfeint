/**
 * MINDFEINT — API server.
 * Holds the 0G broker (private key) server-side; the browser never touches keys.
 *
 * SHARED FILE: rarely edited. It only mounts routers. Add endpoints in your own
 * route file (arena.routes.ts for Dev A, proof.routes.ts for Dev B), not here.
 */
import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { arenaRoutes } from "./arena.routes.js";
import { proofRoutes } from "./proof.routes.js";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, game: "Mindfeint" }));
app.use("/api", arenaRoutes);
app.use("/api", proofRoutes);

// In production, serve the built frontend from this same server so the whole app
// is one origin (no CORS, one domain to authorize in Firebase). The frontend is
// built to ../../frontend/dist by `npm run build`.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback: any non-API route returns index.html.
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
  console.log("📦 serving frontend build from", distDir);
}

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => console.log(`🎭  Mindfeint on http://localhost:${PORT}`));
