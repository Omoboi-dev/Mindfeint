/**
 * No-wallet provider discovery. Confirms 0G testnet is reachable and shows
 * which inference providers/models are available. Costs nothing, needs no key.
 *
 * Run: npx tsx scripts/list-providers.ts
 */
import "dotenv/config";
import { createZGComputeNetworkReadOnlyBroker } from "@0gfoundation/0g-compute-ts-sdk";

const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";

async function main() {
  console.log("→ Connecting (read-only) to", RPC_URL);
  const broker = await createZGComputeNetworkReadOnlyBroker(RPC_URL);
  const services = await broker.inference.listService();
  console.log(`\nFound ${services.length} inference provider(s):\n`);
  for (const s of services) {
    console.log(JSON.stringify(s, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2));
    console.log("—");
  }
}

main().catch((e) => {
  console.error("✗ Discovery failed:", e?.message ?? e);
  process.exit(1);
});
