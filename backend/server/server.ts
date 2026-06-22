/**
 * MINDFEINT — API server.
 * Holds the 0G broker (private key) server-side; the browser never touches keys.
 *
 * SHARED FILE: rarely edited. It only mounts routers. Add endpoints in your own
 * route file (arena.routes.ts for Dev A, proof.routes.ts for Dev B), not here.
 */
import "dotenv/config";
import express from "express";
import { arenaRoutes } from "./arena.routes.js";
import { proofRoutes } from "./proof.routes.js";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, game: "Mindfeint" }));
app.use("/api", arenaRoutes);
app.use("/api", proofRoutes);

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => console.log(`🎭  Mindfeint API on http://localhost:${PORT}`));
