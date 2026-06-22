/**
 * Direct test of the round engine against live 0G — no server needed.
 * Run: npm run test:round
 */
import "dotenv/config";
import { createDetectorRound, voteRound } from "../src/arena.js";

async function main() {
  console.log("→ Assembling a detector round on 0G (5 personas, staggered + retry)…\n");
  const t0 = Date.now();
  const round = await createDetectorRound("spicy");
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`PROMPT: ${round.prompt}\n`);
  for (const s of round.seats) {
    console.log(`  Seat ${s.seat + 1}: ${s.text}`);
  }
  console.log(`\nAssembled in ${secs}s.`);

  // Cast a vote (seat 1) → triggers the 0G Storage write (the provable record).
  console.log("\n→ Voting Seat 1, persisting the round to 0G Storage…");
  const reveal = await voteRound(round.id, "tester", 0);
  console.log(`\n  The human was Seat ${reveal.humanSeat + 1}.`);
  console.log(`  AI answers verified on 0G: ${reveal.verifiedCount}/5`);
  if (reveal.storageRoot) {
    console.log(`  📦 Round stored on 0G Storage:`);
    console.log(`     root: ${reveal.storageRoot}`);
    console.log(`     https://storagescan-galileo.0g.ai/tx/${reveal.storageRoot}`);
  } else {
    console.log("  ⚠ storage root not returned (indexer slow/timeout).");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ round failed:", e?.message ?? e);
  process.exit(1);
});
