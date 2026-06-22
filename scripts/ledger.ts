/**
 * Shows exactly where this wallet's 0G is: native balance, compute-ledger
 * total vs available, and how much is locked in each provider sub-account.
 *
 * Run: npm run ledger
 *      npm run ledger -- --reclaim   (pull all provider sub-account funds back)
 */
import "dotenv/config";
import { ethers } from "ethers";
import { makeBroker } from "../src/og.js";

const reclaim = process.argv.includes("--reclaim");
const f = (v: bigint) => ethers.formatEther(v);

async function main() {
  const { broker, wallet, provider } = await makeBroker();
  console.log("wallet:", wallet.address);
  console.log("native balance:", f(await provider.getBalance(wallet.address)), "0G");

  const led = await broker.ledger.getLedger();
  const total = led.totalBalance ?? 0n;
  const avail = led.availableBalance ?? 0n;
  console.log("\nCompute ledger:");
  console.log("  total    :", f(total), "0G");
  console.log("  available:", f(avail), "0G");
  console.log("  locked   :", f(total - avail), "0G  (reserved in provider sub-accounts)");

  const subs = await broker.ledger.getProvidersWithBalance("inference");
  console.log("\nProvider sub-accounts (inference):");
  if (!subs.length) console.log("  (none)");
  for (const [addr, bal, pending] of subs) {
    console.log(`  ${addr}  balance=${f(bal)} 0G  pendingRefund=${f(pending)} 0G`);
  }

  if (reclaim) {
    console.log("\n→ Reclaiming all inference sub-account funds back to the ledger…");
    await broker.ledger.retrieveFund("inference");
    const after = await broker.ledger.getLedger();
    console.log("  new available:", f(after.availableBalance ?? 0n), "0G");
  }
}

main().catch((e) => {
  console.error("✗ ledger check failed:", e?.message ?? e);
  process.exit(1);
});
