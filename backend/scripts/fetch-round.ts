/**
 * Downloads a round record back FROM 0G Storage by its root hash and prints it.
 * Proof that the game content really lives on 0G, retrievable by anyone, not just
 * shown in our UI.
 *
 * Run: npm run fetch -- <storageRoot>
 */
import "dotenv/config";
import { readFileSync, rmSync } from "node:fs";
import { Indexer } from "@0gfoundation/0g-storage-ts-sdk";

const INDEXER_RPC = process.env.INDEXER_RPC || "https://indexer-storage-testnet-turbo.0g.ai";
const root = process.argv.slice(2).find((a) => a.startsWith("0x"));

async function main() {
  if (!root) {
    console.error("Usage: npm run fetch -- <storageRoot>   (e.g. 0x2362eab2...)");
    process.exit(1);
  }
  console.log("→ Downloading round from 0G Storage:", root);
  const indexer = new Indexer(INDEXER_RPC);
  const out = "round.json";
  const err = await indexer.download(root, out, true);
  if (err) throw new Error(`Download failed: ${err}`);

  const data = JSON.parse(readFileSync(out, "utf8"));
  rmSync(out, { force: true });

  console.log("\n──────── ROUND RECORD FROM 0G STORAGE ────────");
  console.log("game     :", data.game);
  console.log("prompt   :", data.prompt);
  console.log("humanSeat:", data.humanSeat);
  console.log("answers  :");
  for (const a of data.answers ?? []) {
    const tag = a.isHuman ? "HUMAN" : `AI ${a.verified ? "(verified)" : ""}`;
    console.log(`  Seat ${a.seat + 1} [${tag}]: ${a.text}`);
  }
  console.log("──────────────────────────────────────────────");
  console.log("\nThis came straight off 0G Storage, not from the browser or our server.");
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ fetch failed:", e?.message ?? e);
  process.exit(1);
});
