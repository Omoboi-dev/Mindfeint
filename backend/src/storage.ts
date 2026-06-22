/**
 * Uploads JSON to 0G Storage so it becomes an immutable, retrievable record.
 * Returns the storage root (the permanent content id / Merkle root) AND the on-chain
 * transaction hash that committed it — the txHash is what's viewable on the explorer
 * (the root is NOT a transaction, so explorer "/tx/<root>" links don't resolve).
 */
import { ethers } from "ethers";
import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";

const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = process.env.INDEXER_RPC || "https://indexer-storage-testnet-turbo.0g.ai";

export interface UploadResult {
  root: string;
  txHash: string | null;
}

export async function uploadJson(obj: unknown): Promise<UploadResult> {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY required for 0G Storage upload.");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(pk, provider);
  const indexer = new Indexer(INDEXER_RPC);

  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  const data = new MemData(bytes);

  const [tree, treeErr] = await data.merkleTree();
  if (treeErr) throw treeErr;
  const root = tree?.rootHash();
  if (!root) throw new Error("Failed to compute storage root.");

  const [res, uploadErr] = await indexer.upload(data, RPC_URL, signer);
  if (uploadErr) throw uploadErr;

  // The SDK returns { txHash, rootHash, txSeq } (single) or the plural variant.
  let txHash: string | null = null;
  if (res && typeof res === "object") {
    if ("txHash" in res && res.txHash) txHash = res.txHash;
    else if ("txHashes" in res && res.txHashes?.length) txHash = res.txHashes[0];
  }

  return { root, txHash };
}
