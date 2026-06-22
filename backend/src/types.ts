/**
 * MINDFEINT — shared domain types.
 *
 * THIS FILE IS THE CONTRACT between the game layer (Dev A) and the storage/chain
 * layer (Dev B). Treat it as FROZEN: if a shape must change, agree it together
 * first — both sides build against these types.
 */

export type Mode = "detector" | "hider";

/** An AI "mind" — a persona that answers prompts trying to pass as human. */
export interface Persona {
  id: string;
  name: string; // internal label, never shown during a round
  /** Natural-language personality + how it writes. The whole craft lives here. */
  mind: string;
  // --- v2 (on-chain), optional in v1 ---
  ownerAddr?: string; // set when minted as an iNFT
  tokenId?: string; // ERC-7857 token id
  wins?: number; // times mistaken for the human
  rounds?: number;
}

/** One answer in a round. `isHuman`/`personaId` are hidden from the client until reveal. */
export interface Answer {
  seat: number; // anonymized, shuffled seat index (0..N-1)
  text: string;
  isHuman: boolean;
  personaId?: string; // undefined when isHuman
  verified?: boolean; // 0G verifiable-inference proof (AI answers only)
  chatId?: string; // provider response id, for proof linking
}

/** A full round — also the exact shape persisted to 0G Storage. */
export interface Round {
  id: string;
  prompt: string;
  promptPack: string;
  answers: Answer[]; // shuffled + anonymized
  humanSeat: number; // which seat holds the real human
  votes: Record<string, number>; // voterId -> guessed seat
  createdAt: number;
  humanBy?: string; // submitter id of the human seat (anti-self-rig)
  // --- filled by the storage/chain layer (Dev B) ---
  storageRoot?: string; // 0G Storage Merkle root / content id
  storageTx?: string; // on-chain tx that committed the upload (explorer-viewable)
  chainTx?: string; // 0G Chain attestation tx (MindfeintLog)
}

/** What the client sees of a round — secrets stripped out. */
export interface PublicRound {
  id: string;
  prompt: string;
  promptPack: string;
  seats: { seat: number; text: string }[]; // no isHuman / personaId
}

/** Result returned after a detector votes (the reveal). */
export interface Reveal {
  roundId: string;
  humanSeat: number;
  guessedSeat: number;
  correct: boolean; // did the detector pick the human?
  answers: Answer[]; // now with isHuman + verified flags exposed
  verifiedCount: number; // how many AI answers carried a valid 0G proof
  storageRoot?: string | null;
  storageTx?: string | null; // on-chain tx that committed the upload (explorer-viewable)
  chainTx?: string | null; // 0G Chain attestation tx hash
}
