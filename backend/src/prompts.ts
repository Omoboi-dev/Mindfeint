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
    "cold pizza is better than hot pizza and im not arguing about it",
    "well done steak. yeah i said it",
    "ketchup goes in the fridge and on eggs. this is not a debate",
  ],
  "What's a small thing that instantly makes you not trust someone?": [
    "when they're rude to waiters. instant red flag",
    "people who don't say thank you when you hold the door. who raised you",
  ],
  "What's an overrated thing everyone pretends to like?": [
    "rooftop bars. it's just a normal bar but windy and twice the price",
    "champagne. tastes like fancy regret",
  ],
  "What's a hill you'll die on that doesn't actually matter?": [
    "pineapple does not belong on pizza and i won't be taking questions",
    "a hotdog is not a sandwich. it's just not",
  ],
  "If you were a color, why would you be the most disappointing color?": [
    "i'd be beige. literally the color of wet cardboard, just making office walls look depressing",
    "greige. not gray, not beige, just sad and committee-approved",
  ],
  "What is the worst advice you have ever received that you actually followed?": [
    "\"just be yourself.\" did that in an interview and rambled about my soup can collection",
    "someone said follow your passion so i quit a good job to sell candles. anyway",
  ],
  "If humans had a software update, what is the first bug that needs to be patched?": [
    "biting the inside of your own cheek while eating. why does my mouth attack itself",
    "remembering something embarrassing from 10 years ago at 3am. patch that please",
  ],
  "What industry is completely a scam, but we've accepted it as normal?": [
    "printer ink. costs more than the printer, 3 drops of liquid, stops working if you blink",
    "weddings. say the word wedding and every price magically triples",
  ],
  "What's something you do that you think is normal, but others find terrifying?": [
    "i eat the skin off the top of hot chocolate. on purpose",
    "i narrate my cat's inner thoughts out loud in a little voice. constantly",
  ],
  "If aliens visited, what of ours would be the hardest to explain to them?": [
    "money. it's just paper we all agreed to care about",
    "tiny dogs that can't survive outside and we love them more than most people",
  ],
  // --- confess ---
  "What's a lie you tell yourself?": [
    "that i'll start going to bed early. been saying that since 2019",
    "i'll just watch one episode lol",
  ],
  "What's something you do only when nobody's watching?": [
    "practice conversations in the mirror like i'm on a talk show",
    "eat snacks standing in front of the open fridge so it doesn't count",
  ],
  "What's a petty thing that ruins your whole day?": [
    "someone taking the parking spot i was clearly waiting for. ruined. day gone",
    "getting left on read but they posted a story 2 min later. i see you",
  ],
  "What's the most embarrassing thing in your search history (keep it light)?": [
    "\"is cereal a soup\" at 2am. i needed answers",
    "how to spell restaurant. every single time",
  ],
  // --- intellectual ---
  "Is there a limit to human understanding, or can we eventually comprehend everything?": [
    "there's a limit for sure. try explaining taxes to a smart dog, then realize we're the dog to something else",
    "we couldn't even agree what color that dress was so. pretty limited tbh",
  ],
  "If you could know the absolute truth to one question, what would you ask?": [
    "is anyone actually thinking about me as much as i'm anxious they are. (probably not)",
    "what actually happens after we die, just so i can stop spiraling about it",
  ],
  "What does it mean to live a 'good' life in an era of digital noise?": [
    "phone in another room and actual real conversations. touching grass unironically",
    "honestly just being a little bored again sometimes. we lost that",
  ],
  "Does free will exist, or are we just complex algorithms reacting to input?": [
    "feels like free will but i also chose this exact snack again so. who knows",
    "we're definitely just reacting to stuff, i just don't wanna think about it that hard",
  ],
  "If we are living in a simulation, what are the most obvious glitches?": [
    "deja vu obviously. that's them patching something",
    "when you say a word so many times it stops sounding real. clearly a rendering bug",
  ],
  // --- casual ---
  "What's your ultimate comfort food, and why is it superior to all others?": [
    "cold leftover pizza at 2am straight from the fridge. no plate, no microwave, just primal efficiency",
    "buttered toast. sounds sad but it genuinely fixes everything",
  ],
  "What's the best movie you will never watch again because it was too intense?": [
    "uncut gems. great film, gave me an actual stress headache, never again",
    "requiem for a dream. saw it once at 16, still not okay",
  ],
  "If your pet could talk for 10 seconds, what would they tell you?": [
    "my dog would just scream WHERE WERE YOU for the whole 10 seconds",
    "the cat would file a formal complaint about dinner being 4 minutes late",
  ],
  "What is a major trend today that will look ridiculous in 10 years?": [
    "those giant water bottles people carry like it's a personality. we'll cringe",
    "calling everything 'so demure'. it's already aging badly",
  ],
  "What is your secret useless talent that you are oddly proud of?": [
    "i can fold a fitted sheet perfectly. completely useless but i'm proud",
    "i always know what time it is within like 5 minutes. no idea how",
  ],
  // --- scifi ---
  "You wake up in 2099. What's the first thing you Google to see what happened?": [
    "checking if half-life 3 finally came out or if it's still in alpha",
    "who won basically. and whether the bees are okay",
  ],
  "If you could replace any part of your body with cyberware, what would it be and why?": [
    "eyes that don't get tired staring at screens all day",
    "legs that don't ache after one (1) day at a theme park",
  ],
  "An AI offers to manage all your life decisions perfectly. Do you accept?": [
    "no way. it'd be right and i'd resent it for being right",
    "only if it does my taxes and texts people back. the rest i keep",
  ],
  "What is the first luxury item you'd buy if you were a successful space smuggler?": [
    "a ship that doesn't make that noise right before it breaks. pure peace of mind",
    "real coffee. not the freeze-dried space sludge",
  ],
  "If souls existed and could be backed up on a floppy disk, what file format would they be?": [
    "definitely a .zip. compressed trauma and all",
    "mine's a corrupted .txt that won't open right",
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
