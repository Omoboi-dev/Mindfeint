/**
 * MINDFEINT — proof / leaderboard / on-chain routes.
 * OWNER: Dev B (storage / chain). Add proof + chain endpoints here only.
 *
 * v1: the storage record is written inside the vote flow (src/records.ts), so this
 * file starts small. v2: leaderboard, persona iNFT minting, on-chain attestation.
 */
import { Router } from "express";
import { txUrl } from "../src/records.js";
import { downloadJson } from "../src/storage.js";

export const proofRoutes = Router();

// Resolve an on-chain tx hash to its public explorer URL.
proofRoutes.get("/proof/:tx", (req, res) => {
  res.json({ tx: req.params.tx, url: txUrl(req.params.tx) });
});

// Download a stored round record back from 0G Storage by its root, so the app can
// "replay" the saved game straight from the storage network.
proofRoutes.get("/round-record/:root", async (req, res) => {
  const root = req.params.root;
  if (!/^0x[0-9a-fA-F]+$/.test(root)) return res.status(400).json({ error: "Invalid root." });
  try {
    const record = await Promise.race([
      downloadJson(root),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timed out")), 30000)),
    ]);
    res.json(record);
  } catch (e: any) {
    console.error("round-record fetch failed:", e?.message ?? e);
    res.status(502).json({ error: "Could not fetch this round from 0G Storage." });
  }
});

// TODO (Dev B, v2): GET /leaderboard — persona win-rates from on-chain records.
// TODO (Dev B, v2): POST /personas/mint — mint a persona as an ERC-7857 iNFT.
proofRoutes.get("/leaderboard", (_req, res) => {
  res.json({ todo: "v2: on-chain provable leaderboard", entries: [] });
});
