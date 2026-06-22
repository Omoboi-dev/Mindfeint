/**
 * MINDFEINT — prompt packs + seed human answers.
 *
 * OWNER: Dev A (game).
 * Prompts must be spicy/open-ended so humans and AIs both have room to sound human.
 *
 * SEED_HUMANS solves cold-start: until real players seed human answers (hider mode),
 * detector rounds pull a human seat from here so the game is playable from minute one.
 * These are written by a human ON PURPOSE — replace/expand freely.
 */

export interface PromptPack {
  id: string;
  title: string;
  prompts: string[];
}

export const PACKS: PromptPack[] = [
  {
    id: "spicy",
    title: "Spicy Takes",
    prompts: [
      "Defend a food opinion most people would hate you for.",
      "What's a small thing that instantly makes you not trust someone?",
      "What's an overrated thing everyone pretends to like?",
      "What's a hill you'll die on that doesn't actually matter?",
    ],
  },
  {
    id: "confess",
    title: "Confessions",
    prompts: [
      "What's a lie you tell yourself?",
      "What's something you do only when nobody's watching?",
      "What's a petty thing that ruins your whole day?",
      "What's the most embarrassing thing in your search history (keep it light)?",
    ],
  },
];

/** Human-written seed answers, keyed by prompt text, for cold-start detector rounds. */
export const SEED_HUMANS: Record<string, string[]> = {
  "What's a lie you tell yourself?": [
    "that i'll start going to bed early. been saying that since 2019",
    "i'll just watch one episode lol",
  ],
  "Defend a food opinion most people would hate you for.": [
    "cold pizza is better than hot pizza and im not arguing about it",
    "well done steak. yeah i said it",
  ],
};

export function randomPrompt(packId: string): { pack: string; prompt: string } {
  const pack = PACKS.find((p) => p.id === packId) ?? PACKS[0];
  const prompt = pack.prompts[Math.floor(Math.random() * pack.prompts.length)];
  return { pack: pack.id, prompt };
}

/** A seed human answer for a prompt, or a generic fallback. */
export function seedHuman(prompt: string): string {
  const list = SEED_HUMANS[prompt];
  if (list && list.length) return list[Math.floor(Math.random() * list.length)];
  return "honestly no idea, never really thought about it that hard";
}
