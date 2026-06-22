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
import { uploadJson } from "./storage.js";
import { attestRound } from "./chain.js";
import type { Round } from "./types.js";

export interface RecordRefs {
  storageRoot: string | null;
  chainTx?: string | null;
}

/**
 * Persist a finished round so anyone can verify it was fair. Bounded so a slow
 * indexer can't hang the reveal screen.
 */
export async function recordRound(round: Round): Promise<RecordRefs> {
  try {
    const root = await Promise.race<string | null>([
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
    if (root) console.log(`📦 round ${round.id} stored on 0G — root: ${root}`);
    else console.warn(`0G storage timed out for round ${round.id}`);

    // Anchor the storage root on 0G Chain (the third primitive). No-ops if unconfigured.
    const chainTx = root ? await attestRound(root) : null;
    return { storageRoot: root, chainTx };
  } catch (e: any) {
    console.error("recordRound failed:", e?.message ?? e);
    return { storageRoot: null };
  }
}

/** Public explorer URL for a stored round (used by the verdict card). */
export function storageUrl(root: string): string {
  return `https://storagescan-galileo.0g.ai/tx/${root}`;
}
