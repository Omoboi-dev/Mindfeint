/**
 * MINDFEINT — round engine.
 *
 * OWNER: Dev A (game).
 * Assembles a table (AI personas + one human seat), runs verified inference, shuffles
 * + anonymizes, scores votes, and hands finished rounds to the records layer (Dev B).
 *
 * v1 store is in-memory (a Map). Swap for a real store later; the interface stays.
 */
import { randomUUID } from "node:crypto";
import { drawPersonas } from "./personas.js";
import { randomPrompt, seedHuman } from "./prompts.js";
import { askAll } from "./inference.js";
import { recordRound } from "./records.js";
import type { Answer, Mode, PublicRound, Reveal, Round } from "./types.js";

const TABLE_SIZE = 6; // 5 AI + 1 human
const MAX_HUMAN_USES = 3; // a hider answer is shown to at most this many detectors, then retired
const rounds = new Map<string, Round>();

/** Queue of real human answers (seeded by hider mode) for detector rounds to consume. */
const humanQueue: { prompt: string; text: string; by: string; uses: number }[] = [];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Create a detector round: 5 verified AI personas + 1 human seat. The human seat is
 * pulled from the queue (real player answers) or falls back to a seed human so the
 * game is playable from minute one.
 */
export async function createDetectorRound(packId: string, voterId = "anon"): Promise<PublicRound> {
  const { pack, prompt } = randomPrompt(packId);

  // Source the human answer: a queued real one for this prompt that the *current*
  // player did NOT write (so they can't recognize/rig their own answer), else a seed.
  const qIdx = humanQueue.findIndex((h) => h.prompt === prompt && h.by !== voterId);
  let humanText: string;
  let humanBy: string | undefined;
  if (qIdx >= 0) {
    const picked = humanQueue[qIdx];
    humanText = picked.text;
    humanBy = picked.by;
    picked.uses += 1;
    // Retire the answer once it has been shown to enough detectors, so a planted
    // answer can't be farmed indefinitely.
    if (picked.uses >= MAX_HUMAN_USES) humanQueue.splice(qIdx, 1);
  } else {
    humanText = seedHuman(prompt);
  }

  const personas = drawPersonas(TABLE_SIZE - 1);
  const aiAnswers = await askAll(personas, prompt, true);

  const raw: Answer[] = [
    { seat: -1, text: humanText, isHuman: true },
    ...personas.map((p, i) => ({
      seat: -1,
      text: aiAnswers[i].text,
      isHuman: false,
      personaId: p.id,
      verified: aiAnswers[i].verified,
      chatId: aiAnswers[i].chatId,
    })),
  ];

  const seated = shuffle(raw).map((a, i) => ({ ...a, seat: i }));
  const humanSeat = seated.findIndex((a) => a.isHuman);

  const round: Round = {
    id: randomUUID(),
    prompt,
    promptPack: pack,
    answers: seated,
    humanSeat,
    votes: {},
    createdAt: Date.now(),
    humanBy,
  };
  rounds.set(round.id, round);
  return toPublic(round);
}

/** Pick a prompt for a hider to answer (shown before they write). */
export function pickHiderPrompt(packId: string): { pack: string; prompt: string } {
  return randomPrompt(packId);
}

/** Hider mode: queue a real human answer, tied to the exact prompt + who wrote it. */
export function submitHiderAnswer(prompt: string, text: string, by = "anon"): { ok: true } {
  humanQueue.push({ prompt, text: text.trim(), by, uses: 0 });
  return { ok: true };
}

/** Record a detector's vote, reveal the truth, and persist the round to 0G. */
export async function voteRound(roundId: string, voterId: string, seat: number): Promise<Reveal> {
  const round = rounds.get(roundId);
  if (!round) throw new Error("Round not found.");
  round.votes[voterId] = seat;

  const refs = await recordRound(round); // Dev B layer
  round.storageRoot = refs.storageRoot ?? undefined;
  round.storageTx = refs.storageTx ?? undefined;
  round.chainTx = refs.chainTx ?? undefined;

  const verifiedCount = round.answers.filter((a) => !a.isHuman && a.verified).length;
  return {
    roundId: round.id,
    humanSeat: round.humanSeat,
    guessedSeat: seat,
    correct: seat === round.humanSeat,
    answers: round.answers,
    verifiedCount,
    storageRoot: round.storageRoot ?? null,
    storageTx: round.storageTx ?? null,
    chainTx: round.chainTx ?? null,
  };
}

export function getPublicRound(roundId: string): PublicRound | null {
  const r = rounds.get(roundId);
  return r ? toPublic(r) : null;
}

function toPublic(round: Round): PublicRound {
  return {
    id: round.id,
    prompt: round.prompt,
    promptPack: round.promptPack,
    seats: round.answers.map((a) => ({ seat: a.seat, text: a.text })),
  };
}
