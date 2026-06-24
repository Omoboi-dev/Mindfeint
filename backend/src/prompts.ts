/**
 * MINDFEINT — prompt packs + seed human answers.
 *
 * OWNER: Dev A (game).
 * Prompts must be spicy/open-ended so humans and AIs both have room to sound human.
 *
 * SEED_HUMANS solves cold-start: until real players seed human answers (hider mode),
 * detector rounds pull a human seat from here so the game is playable from minute one.
 * Each SEED_HUMANS key MUST match a prompt that exists in a pack below, so it can be
 * selected. These are written by a human ON PURPOSE — replace/expand freely.
 */

export interface PromptPack {
  id: string;
  title: string;
  prompts: string[];
}

export const PACKS: PromptPack[] = [
  {
    id: "spicy",
    title: "🌶️ Spicy Takes",
    prompts: [
      "Defend a food opinion most people would hate you for.",
      "What's a small thing that instantly makes you not trust someone?",
      "What's an overrated thing everyone pretends to like?",
      "What's a hill you'll die on that doesn't actually matter?",
      "If you were a color, why would you be the most disappointing color?",
      "What is the worst advice you have ever received that you actually followed?",
      "If humans had a software update, what is the first bug that needs to be patched?",
      "What industry is completely a scam, but we've accepted it as normal?",
      "What's something you do that you think is normal, but others find terrifying?",
      "If aliens visited, what of ours would be the hardest to explain to them?",
    ],
  },
  {
    id: "confess",
    title: "🤫 Confessions",
    prompts: [
      "What's a lie you tell yourself?",
      "What's something you do only when nobody's watching?",
      "What's a petty thing that ruins your whole day?",
      "What's the most embarrassing thing in your search history (keep it light)?",
    ],
  },
  {
    id: "intellectual",
    title: "🔬 Intellectual & Deep",
    prompts: [
      "Is there a limit to human understanding, or can we eventually comprehend everything?",
      "If you could know the absolute truth to one question, what would you ask?",
      "What does it mean to live a 'good' life in an era of digital noise?",
      "Does free will exist, or are we just complex algorithms reacting to input?",
      "If we are living in a simulation, what are the most obvious glitches?",
    ],
  },
  {
    id: "casual",
    title: "☕ Casual Chit-Chat",
    prompts: [
      "What's your ultimate comfort food, and why is it superior to all others?",
      "What's the best movie you will never watch again because it was too intense?",
      "If your pet could talk for 10 seconds, what would they tell you?",
      "What is a major trend today that will look ridiculous in 10 years?",
      "What is your secret useless talent that you are oddly proud of?",
    ],
  },
  {
    id: "scifi",
    title: "🌌 Sci-Fi & Cyberpunk",
    prompts: [
      "You wake up in 2099. What's the first thing you Google to see what happened?",
      "If you could replace any part of your body with cyberware, what would it be and why?",
      "An AI offers to manage all your life decisions perfectly. Do you accept?",
      "What is the first luxury item you'd buy if you were a successful space smuggler?",
      "If souls existed and could be backed up on a floppy disk, what file format would they be?",
    ],
  },
];

/** Human-written seed answers, keyed by prompt text, for cold-start detector rounds. */
export const SEED_HUMANS: Record<string, string[]> = {
  // --- spicy ---
  "Defend a food opinion most people would hate you for.": [
    "Cold pizza straight from the fridge beats a fresh hot slice, and I will defend that forever.",
    "A well done steak is perfectly fine and I am tired of pretending it is a crime.",
  ],
  "What's a small thing that instantly makes you not trust someone?": [
    "The way they treat a waiter tells me everything I need to know.",
    "People who never say thank you when you hold the door open for them.",
  ],
  "What's an overrated thing everyone pretends to like?": [
    "Rooftop bars. It is just a normal bar, only windier and twice the price.",
    "Champagne, honestly. It tastes like expensive regret.",
  ],
  "What's a hill you'll die on that doesn't actually matter?": [
    "Pineapple does not belong on pizza, and I will not be taking questions.",
    "A hot dog is simply not a sandwich, and that is the end of it.",
  ],
  "If you were a color, why would you be the most disappointing color?": [
    "Beige, because I would be the exact shade of a boring office wall.",
    "A sad grey that can never quite decide what it wants to be.",
  ],
  "What is the worst advice you have ever received that you actually followed?": [
    "Someone told me to just be myself in an interview, and it went badly.",
    "I was told to follow my passion, so I left a good job to sell candles.",
  ],
  "If humans had a software update, what is the first bug that needs to be patched?": [
    "Biting the inside of your own cheek while eating. Why does my mouth attack itself?",
    "Remembering an embarrassing moment from years ago at three in the morning.",
  ],
  "What industry is completely a scam, but we've accepted it as normal?": [
    "Printer ink. It costs more than the printer and runs out if you look at it.",
    "Weddings. The moment you say the word, every price suddenly triples.",
  ],
  "What's something you do that you think is normal, but others find terrifying?": [
    "I hold full conversations with my pet, including their side of it.",
    "I eat the skin off the top of my hot chocolate on purpose.",
  ],
  "If aliens visited, what of ours would be the hardest to explain to them?": [
    "Money. It is just paper that we all quietly agreed to care about.",
    "Tiny dogs that cannot survive outside, yet we adore them more than people.",
  ],
  // --- confess ---
  "What's a lie you tell yourself?": [
    "That I will finally start going to bed early. I have said it for years.",
    "That I will only watch one more episode and then go to sleep.",
  ],
  "What's something you do only when nobody's watching?": [
    "I practice conversations in the mirror as if I am on a talk show.",
    "I eat snacks standing in front of the open fridge so they do not count.",
  ],
  "What's a petty thing that ruins your whole day?": [
    "Someone taking the parking spot I was clearly waiting for.",
    "Being left on read right after they post a story for everyone else.",
  ],
  "What's the most embarrassing thing in your search history (keep it light)?": [
    "I once searched whether cereal counts as a soup at two in the morning.",
    "How to spell restaurant, basically every single time I need it.",
  ],
  // --- intellectual ---
  "Is there a limit to human understanding, or can we eventually comprehend everything?": [
    "There is definitely a limit. We are probably some larger thing's confused puppy.",
    "We cannot even agree on what color a dress is, so I would say fairly limited.",
  ],
  "If you could know the absolute truth to one question, what would you ask?": [
    "Whether anyone thinks about me as much as I anxiously assume they do.",
    "What actually happens after we die, just so I can stop worrying about it.",
  ],
  "What does it mean to live a 'good' life in an era of digital noise?": [
    "Leaving the phone in another room and having real conversations again.",
    "Being a little bored sometimes. I think we quietly lost that.",
  ],
  "Does free will exist, or are we just complex algorithms reacting to input?": [
    "It feels like free will, yet I chose this exact snack again, so who knows.",
    "We are probably just reacting to everything, but I prefer not to dwell on it.",
  ],
  "If we are living in a simulation, what are the most obvious glitches?": [
    "Deja vu, obviously. That is clearly them patching something in the background.",
    "When a word stops sounding real after you repeat it too many times.",
  ],
  // --- casual ---
  "What's your ultimate comfort food, and why is it superior to all others?": [
    "Cold leftover pizza at midnight. No plate, no microwave, just pure efficiency.",
    "Buttered toast. It sounds plain, but it genuinely fixes a bad day.",
  ],
  "What's the best movie you will never watch again because it was too intense?": [
    "Uncut Gems. A brilliant film that gave me an actual stress headache.",
    "Requiem for a Dream. I saw it once as a teenager and never quite recovered.",
  ],
  "If your pet could talk for 10 seconds, what would they tell you?": [
    "My dog would simply scream, asking where I have been all day.",
    "The cat would file a formal complaint about dinner arriving four minutes late.",
  ],
  "What is a major trend today that will look ridiculous in 10 years?": [
    "The enormous water bottles people carry around like a personality trait.",
    "Calling absolutely everything aesthetic. It is already starting to age badly.",
  ],
  "What is your secret useless talent that you are oddly proud of?": [
    "I can fold a fitted sheet perfectly, which helps me in no real way.",
    "I almost always know the time within five minutes without checking.",
  ],
  // --- scifi ---
  "You wake up in 2099. What's the first thing you Google to see what happened?": [
    "Whether the bees are alright and who ended up winning everything.",
    "If the game I had been waiting on finally came out, or it is still delayed.",
  ],
  "If you could replace any part of your body with cyberware, what would it be and why?": [
    "Eyes that never get tired from staring at a screen all day.",
    "Legs that do not ache after a single day of walking around a theme park.",
  ],
  "An AI offers to manage all your life decisions perfectly. Do you accept?": [
    "No, because it would be right every time and I would resent it for that.",
    "Only if it handles my taxes and replies to messages. I keep the rest.",
  ],
  "What is the first luxury item you'd buy if you were a successful space smuggler?": [
    "A ship that does not make that terrifying noise right before it breaks down.",
    "Real coffee, not the freeze dried sludge they serve out there.",
  ],
  "If souls existed and could be backed up on a floppy disk, what file format would they be?": [
    "A zip file, quietly compressing far too much baggage.",
    "Mine would be a corrupted text file that refuses to open properly.",
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
