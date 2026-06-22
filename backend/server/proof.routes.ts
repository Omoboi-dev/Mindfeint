/**
 * MINDFEINT — proof / leaderboard / on-chain routes.
 * OWNER: Dev B (storage / chain). Add proof + chain endpoints here only.
 *
 * v1: the storage record is written inside the vote flow (src/records.ts), so this
 * file starts small. v2: leaderboard, persona iNFT minting, on-chain attestation.
 */
import { Router } from "express";
import { txUrl } from "../src/records.js";

export const proofRoutes = Router();

// Resolve an on-chain tx hash to its public explorer URL.
proofRoutes.get("/proof/:tx", (req, res) => {
  res.json({ tx: req.params.tx, url: txUrl(req.params.tx) });
});

// TODO (Dev B, v2): GET /leaderboard — persona win-rates from on-chain records.
// TODO (Dev B, v2): POST /personas/mint — mint a persona as an ERC-7857 iNFT.
proofRoutes.get("/leaderboard", (_req, res) => {
  res.json({ todo: "v2: on-chain provable leaderboard", entries: [] });
});
