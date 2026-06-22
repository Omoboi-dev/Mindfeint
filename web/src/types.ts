/**
 * Frontend mirror of the public API shapes. Keep in sync with src/types.ts
 * (only the client-visible parts live here).
 */
export interface PublicRound {
  id: string;
  prompt: string;
  promptPack: string;
  seats: { seat: number; text: string }[];
}

export interface Answer {
  seat: number;
  text: string;
  isHuman: boolean;
  personaId?: string;
  verified?: boolean;
}

export interface Reveal {
  roundId: string;
  humanSeat: number;
  guessedSeat: number;
  correct: boolean;
  answers: Answer[];
  verifiedCount: number;
  storageRoot?: string | null;
  chainTx?: string | null;
}

export interface Pack {
  id: string;
  title: string;
}
