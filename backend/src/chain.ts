/**
 * MINDFEINT — 0G Chain attestation (v1 minimal).
 *
 * OWNER: Dev B (chain).
 * Anchors a round's 0G Storage root on 0G Chain via the MindfeintLog contract.
 * If ATTEST_ADDRESS isn't set, this no-ops gracefully (storage-only still works).
 */
import { ethers } from "ethers";

const RPC = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
export const ATTEST_ABI = [
  "function attest(bytes32 storageRoot) external",
  "function total() view returns (uint256)",
  "event RoundAttested(bytes32 indexed storageRoot, address indexed by, uint256 timestamp)",
];

/** Write the storage root on-chain. Returns the tx hash, or null if unconfigured/slow. */
export async function attestRound(storageRoot: string): Promise<string | null> {
  const addr = process.env.ATTEST_ADDRESS;
  const pk = process.env.PRIVATE_KEY;
  if (!addr || !pk) return null; // attestation not configured — fine, storage still proves it
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(pk, provider);
    const c = new ethers.Contract(addr, ATTEST_ABI, wallet);
    const hash = await Promise.race<string | null>([
      (async () => {
        const tx = await c.attest(storageRoot);
        await tx.wait();
        return tx.hash as string;
      })(),
      new Promise<null>((r) => setTimeout(() => r(null), 30000)),
    ]);
    if (hash) console.log(`⛓️  round attested on 0G Chain — tx: ${hash}`);
    return hash;
  } catch (e: any) {
    console.error("attestRound failed:", e?.message ?? e);
    return null;
  }
}

export function chainTxUrl(tx: string): string {
  return `https://chainscan-galileo.0g.ai/tx/${tx}`;
}
