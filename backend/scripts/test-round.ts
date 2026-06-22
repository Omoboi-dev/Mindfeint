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
  console.log(`\n  📦 0G Storage root (content id): ${reveal.storageRoot ?? "—"}`);
  if (reveal.storageTx) {
    console.log(`  🔗 Storage commit tx (viewable): https://chainscan-galileo.0g.ai/tx/${reveal.storageTx}`);
  } else {
    console.log("  ⚠ no storage commit tx (indexer slow/timeout).");
  }
  if (reveal.chainTx) {
    console.log(`  ⛓️  Attestation tx (viewable):    https://chainscan-galileo.0g.ai/tx/${reveal.chainTx}`);
  } else {
    console.log("  ⚠ no attestation tx (ATTEST_ADDRESS unset or attest failed).");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ round failed:", e?.message ?? e);
  process.exit(1);
});
