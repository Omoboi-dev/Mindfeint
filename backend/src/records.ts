/**
 * MINDFEINT — provable round records (0G Storage) + on-chain attestation.
 *
 * OWNER: Dev B (storage / chain).
 * This is the seam the game layer calls. The arena never touches 0G Storage or the
 * chain directly — it calls recordRound() and gets back the proof references. That
 * keeps the two work-streams from colliding.
 *
 * v1: persist the full round to 0G Storage, return the root hash.
 * v2: also attest the round outcome + persona win-record on-chain (0G Chain).
 */
import { uploadJson, type UploadResult } from "./storage.js";
import { attestRound } from "./chain.js";
import type { Round } from "./types.js";

export interface RecordRefs {
  storageRoot: string | null; // Merkle root / content id (not a tx)
  storageTx?: string | null; // on-chain tx that committed the upload (viewable on explorer)
  chainTx?: string | null; // our MindfeintLog attestation tx
}

/**
 * Persist a finished round so anyone can verify it was fair. Bounded so a slow
 * indexer can't hang the reveal screen.
 */
export async function recordRound(round: Round): Promise<RecordRefs> {
  try {
    const upload = await Promise.race<UploadResult | null>([
      uploadJson({
        game: "Mindfeint",
        roundId: round.id,
        prompt: round.prompt,
        promptPack: round.promptPack,
        answers: round.answers, // includes isHuman + per-answer 0G verified flags
        humanSeat: round.humanSeat,
        votes: round.votes,
        ts: round.createdAt,
      }),
      new Promise<null>((r) => setTimeout(() => r(null), 45000)),
    ]);
    const root = upload?.root ?? null;
    const storageTx = upload?.txHash ?? null;
    if (root) console.log(`📦 round ${round.id} stored on 0G — root: ${root} tx: ${storageTx}`);
    else console.warn(`0G storage timed out for round ${round.id}`);

    // Anchor the storage root on 0G Chain (the third primitive). No-ops if unconfigured.
    const chainTx = root ? await attestRound(root) : null;
    return { storageRoot: root, storageTx, chainTx };
  } catch (e: any) {
    console.error("recordRound failed:", e?.message ?? e);
    return { storageRoot: null };
  }
}

/** Explorer URL for an on-chain transaction (storage-commit tx or attestation tx). */
export function txUrl(txHash: string): string {
  return `https://chainscan-galileo.0g.ai/tx/${txHash}`;
}
