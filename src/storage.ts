/**
 * Uploads a fight replay to 0G Storage so it becomes an immutable, retrievable
 * on-chain record. Returns the storage root hash (the permanent content id).
 */
import { ethers } from "ethers";
import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";

const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = process.env.INDEXER_RPC || "https://indexer-storage-testnet-turbo.0g.ai";

export async function uploadJson(obj: unknown): Promise<string> {
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

  const [, uploadErr] = await indexer.upload(data, RPC_URL, signer);
  if (uploadErr) throw uploadErr;

  return root;
}
