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
const rounds = new Map<string, Round>();

/** Queue of real human answers (seeded by hider mode) for detector rounds to consume. */
const humanQueue: { prompt: string; text: string }[] = [];

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
export async function createDetectorRound(packId: string): Promise<PublicRound> {
  const { pack, prompt } = randomPrompt(packId);

  // Source the human answer: a queued real one for this prompt, else a seed.
  const qIdx = humanQueue.findIndex((h) => h.prompt === prompt);
  const humanText = qIdx >= 0 ? humanQueue.splice(qIdx, 1)[0].text : seedHuman(prompt);

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
  };
  rounds.set(round.id, round);
  return toPublic(round);
}

/** Hider mode: queue a real human answer to seed future detector rounds. */
export function submitHiderAnswer(packId: string, text: string): { prompt: string } {
  const { prompt } = randomPrompt(packId);
  humanQueue.push({ prompt, text: text.trim() });
  return { prompt };
}

/** Record a detector's vote, reveal the truth, and persist the round to 0G. */
export async function voteRound(roundId: string, voterId: string, seat: number): Promise<Reveal> {
  const round = rounds.get(roundId);
  if (!round) throw new Error("Round not found.");
  round.votes[voterId] = seat;

  const refs = await recordRound(round); // Dev B layer
  round.storageRoot = refs.storageRoot ?? undefined;
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
