import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";

/**
 * Creates an authenticated 0G Compute broker from env config.
 * The broker signs and pays for inference, so this MUST run server-side only.
 */
export async function makeBroker() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || pk.includes("your_private_key")) {
    throw new Error("Set PRIVATE_KEY in .env (see .env.example).");
  }
  const rpcUrl = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);
  const broker = await createZGComputeNetworkBroker(wallet);
  return { broker, wallet, provider };
}

/** Reads the compute ledger balance in whole 0G, tolerating an uncreated ledger. */
export async function readBalance(broker: any): Promise<number | null> {
  try {
    const acct = await broker.ledger.getLedger();
    return Number(ethers.formatEther(acct.availableBalance ?? acct.totalBalance ?? 0n));
  } catch {
    return null; // ledger not created yet
  }
}
