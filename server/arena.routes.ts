/**
 * MINDFEINT — game routes.
 * OWNER: Dev A (game). Add game endpoints here only.
 */
import { Router } from "express";
import {
  createDetectorRound,
  getPublicRound,
  submitHiderAnswer,
  voteRound,
} from "../src/arena.js";
import { PACKS } from "../src/prompts.js";

export const arenaRoutes = Router();

// Prompt packs for the lobby UI.
arenaRoutes.get("/packs", (_req, res) => {
  res.json(PACKS.map((p) => ({ id: p.id, title: p.title })));
});

// Start a detector round: returns an anonymized table of 6 answers.
arenaRoutes.post("/round", async (req, res) => {
  try {
    const packId = String(req.body?.pack ?? "spicy");
    const round = await createDetectorRound(packId);
    res.json(round);
  } catch (e: any) {
    console.error("create round error:", e);
    res.status(500).json({ error: e?.message ?? String(e) });
  }
});

// Fetch a round again (refresh-safe).
arenaRoutes.get("/round/:id", (req, res) => {
  const round = getPublicRound(req.params.id);
  if (!round) return res.status(404).json({ error: "Round not found." });
  res.json(round);
});

// Vote which seat is the human → reveal + 0G proof refs.
arenaRoutes.post("/round/:id/vote", async (req, res) => {
  try {
    const seat = Number(req.body?.seat);
    const voterId = String(req.body?.voterId ?? "anon");
    if (Number.isNaN(seat)) return res.status(400).json({ error: "seat required" });
    const reveal = await voteRound(req.params.id, voterId, seat);
    res.json(reveal);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? String(e) });
  }
});

// Hider mode: submit a human answer to seed future rounds.
arenaRoutes.post("/hide", (req, res) => {
  const text = String(req.body?.text ?? "").trim();
  const packId = String(req.body?.pack ?? "spicy");
  if (!text) return res.status(400).json({ error: "Write an answer." });
  res.json(submitHiderAnswer(packId, text));
});
