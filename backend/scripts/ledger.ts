/**
 * Shows exactly where this wallet's 0G is: native balance, compute-ledger
 * total vs available, and how much is locked in each provider sub-account.
 *
 * Run: npm run ledger
 *      npm run ledger -- --reclaim                 (pull ALL provider sub-accounts back)
 *      npm run ledger -- --reclaim-provider 0x...   (pull ONE provider's funds back)
 *      npm run ledger -- --deposit 0.4              (move 0.4 0G from wallet into the ledger)
 */
import "dotenv/config";
import { ethers } from "ethers";
import { makeBroker } from "../src/og.js";

const reclaim = process.argv.includes("--reclaim");
const reclaimProvIdx = process.argv.indexOf("--reclaim-provider");
const reclaimProvider = reclaimProvIdx >= 0 ? process.argv[reclaimProvIdx + 1] : null;
const depositIdx = process.argv.indexOf("--deposit");
const depositAmt = depositIdx >= 0 ? Number(process.argv[depositIdx + 1]) : 0;
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

  if (depositAmt > 0) {
    console.log(`\n→ Depositing ${depositAmt} 0G from wallet into the ledger…`);
    await broker.ledger.depositFund(depositAmt);
    const after = await broker.ledger.getLedger();
    console.log("  new available:", f(after.availableBalance ?? 0n), "0G");
  }

  if (reclaimProvider) {
    console.log(`\n→ Reclaiming funds from provider ${reclaimProvider} back to the ledger…`);
    await broker.ledger.retrieveFundFromProvider("inference", reclaimProvider);
    console.log("  requested. funds move to pendingRefund, then to available after the");
    console.log("  provider lock window. run 'npm run ledger' again later to see it land.");
    const after = await broker.ledger.getLedger();
    console.log("  available now:", f(after.availableBalance ?? 0n), "0G");
  }

  if (reclaim) {
    console.log("\n→ Reclaiming ALL inference sub-account funds back to the ledger…");
    await broker.ledger.retrieveFund("inference");
    const after = await broker.ledger.getLedger();
    console.log("  new available:", f(after.availableBalance ?? 0n), "0G");
  }
}

main().catch((e) => {
  console.error("✗ ledger check failed:", e?.message ?? e);
  process.exit(1);
});
