export interface PromptPack {
  id: string;
  title: string;
}

export interface PublicRound {
  id: string;
  prompt: string;
  promptPack: string;
  seats: { seat: number; text: string }[];
}

export interface RevealAnswer {
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
  answers: RevealAnswer[];
  verifiedCount: number;
  storageRoot?: string | null;
  storageTx?: string | null;
  chainTx?: string | null;
}

export type AppState =
  | "LOGIN"
  | "LOBBY"
  | "WAITING"
  | "DETECTOR"
  | "REVEAL"
  | "HIDER"
  | "HIDER_SUCCESS"
  | "HOWTO"
  | "ABOUT"
  | "HISTORY"
  | "ROADMAP";

/** Authenticated player identity — wraps Firebase User + ZeroDev smart wallet. */
export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  /** ERC-4337 Kernel smart wallet address provisioned via ZeroDev (empty while loading). */
  smartWalletAddress: string;
}

export interface GameHistoryEntry {
  roundId: string;
  prompt: string;
  guessedSeat: number;
  humanSeat: number;
  correct: boolean;
  timestamp: string;
  storageRoot?: string | null; // 0G storage root, used to replay the saved round
  storageTx?: string | null; // 0G storage commit tx (explorer-viewable)
  chainTx?: string | null; // 0G chain attestation tx
}

/** A round record as stored on 0G Storage (returned by /api/round-record/:root). */
export interface StoredRound {
  game?: string;
  prompt: string;
  promptPack?: string;
  humanSeat: number;
  votes?: Record<string, number>;
  ts?: number;
  answers: {
    seat: number;
    text: string;
    isHuman: boolean;
    personaId?: string;
    verified?: boolean;
  }[];
}

export interface PlayerStats {
  roundsPlayed: number;
  humansSpotted: number;
  fooledCount: number;
  currentStreak: number;
  highestStreak: number;
}
