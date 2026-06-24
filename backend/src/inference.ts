/**
 * MINDFEINT — 0G verifiable inference wrapper.
 *
 * OWNER: Dev A (game), but the verification half is the 0G proof Dev B surfaces in UI.
 * Adapted from the proven Dungeon Raid llm.ts. Caches the broker + provider so we pay
 * the connect/acknowledge cost once, then reuse it for every persona answer.
 *
 * THE CORE OF THE GAME: each persona answer is produced by a real model on 0G and
 * checked against the provider's TEE signature (processResponse) → `verified: true`.
 */
import { makeBroker } from "./og.js";
import { PASSING_RULES } from "./personas.js";
import type { Persona } from "./types.js";

let cache: { broker: any; provider: string; endpoint: string; model: string } | null = null;

async function getInference() {
  if (cache) return cache;
  const { broker } = await makeBroker();
  const services = await broker.inference.listService();
  const chatbot = services.find((s: any) => s.serviceType === "chatbot") ?? services[0];
  if (!chatbot) throw new Error("No 0G chatbot provider available.");
  const provider = process.env.PROVIDER_ADDRESS || chatbot.provider;
  try {
    if (!(await broker.inference.acknowledged(provider))) {
      await broker.inference.acknowledgeProviderSigner(provider);
    }
  } catch {
    /* already acknowledged or owner-managed */
  }
  const { endpoint, model } = await broker.inference.getServiceMetadata(provider);
  cache = { broker, provider, endpoint, model };
  return cache;
}

export interface PersonaAnswer {
  text: string;
  verified?: boolean;
  chatId?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Hard cap so AI answers stay as short as a real human's. Keep the first sentence;
// if it is still too long, trim to a word boundary. Roughly the length of our human
// seed answers, plus a little.
const MAX_ANSWER_CHARS = 150;
function shorten(raw: string): string {
  let t = raw.replace(/\s+/g, " ").trim();
  // Drop the filler opener the model loves ("Well, ...") — it became a tell.
  t = t.replace(/^(well|honestly|so|hmm|oh),?\s+/i, "");
  t = t.charAt(0).toUpperCase() + t.slice(1);

  // Keep whole sentences up to the budget (so we get one or two short ones,
  // matching how a real person answers — never a single clipped word, never a paragraph).
  const parts = t.match(/[^.!?]+[.!?]?/g) ?? [t];
  let out = "";
  for (const p of parts) {
    const next = (out + p).trim();
    if (out && next.length > MAX_ANSWER_CHARS) break;
    out = next;
  }
  out = out.trim();

  // Safety net: if even the first sentence is huge, trim to a word boundary.
  if (out.length > MAX_ANSWER_CHARS) {
    const cut = out.slice(0, MAX_ANSWER_CHARS);
    const sp = cut.lastIndexOf(" ");
    out = (sp > 40 ? cut.slice(0, sp) : cut).replace(/[,;:\s]+$/, "");
    if (!/[.!?]$/.test(out)) out += ".";
  }
  return out;
}

/**
 * Ask one persona, retrying a couple of times. The 0G provider can blip (auto-funding,
 * nonce collisions when calls fire together, cold starts), so a single attempt isn't
 * reliable — we retry on empty/failed answers and only then fall back to a safe line.
 */
// Distinct per-persona fallbacks so a failed call never shows as a duplicate line
// (identical answers are a dead giveaway and make the table look broken).
const FALLBACKS = [
  "Honestly, I have never really thought about that.",
  "No strong feelings on this one either way.",
  "I could not tell you, this one is tricky.",
  "I am drawing a complete blank here.",
  "Not sure, I would have to think about it.",
  "Nothing really comes to mind for this one.",
];

function fallbackFor(persona: Persona): string {
  const h = [...persona.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACKS[h % FALLBACKS.length];
}

export async function askPersona(
  persona: Persona,
  prompt: string,
  verify = true,
): Promise<PersonaAnswer> {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await sleep(700 * attempt);
    const out = await askPersonaOnce(persona, prompt, verify);
    if (out) return out;
  }
  return { text: fallbackFor(persona) };
}

/** One real attempt. Returns null on failure or empty content so the caller can retry. */
async function askPersonaOnce(
  persona: Persona,
  prompt: string,
  verify: boolean,
): Promise<PersonaAnswer | null> {
  const { broker, provider, endpoint, model } = await getInference();

  const system = `You are role-playing a person. PERSONA: ${persona.mind}\n${PASSING_RULES}`;
  const user = `Prompt: ${prompt}\nAnswer in character, one or two casual sentences.`;

  let data: any;
  let chatId: string | undefined;
  try {
    const headers = await broker.inference.getRequestHeaders(provider, user);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 1.0,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    data = await res.json();
    chatId = res.headers.get("ZG-Res-Key") || data?.id;
  } catch (e: any) {
    console.error(`askPersona ${persona.id} failed/timeout:`, e?.message ?? e);
    return null; // let the caller retry
  }

  let text = String(data?.choices?.[0]?.message?.content ?? "").trim();
  // Strip surrounding quotes the model sometimes adds.
  text = text.replace(/^["'](.*)["']$/s, "$1").trim();
  if (!text) return null; // empty content → retry
  // Keep it short so a rambling AI answer can't be spotted next to a tight human one.
  text = shorten(text);

  let verified: boolean | undefined;
  if (verify && chatId) {
    try {
      const usage = data?.usage ? JSON.stringify(data.usage) : undefined;
      const ok = await Promise.race<boolean | null>([
        broker.inference.processResponse(provider, chatId, usage),
        new Promise<null>((r) => setTimeout(() => r(null), 25000)),
      ]);
      verified = ok ?? undefined;
    } catch {
      verified = false;
    }
  }

  return { text, verified, chatId };
}

/**
 * Ask personas SEQUENTIALLY. Parallel calls share one wallet, and their signed
 * request headers + on-chain settlement (processResponse) collide on nonces — which
 * was causing several answers per round to fail. One-at-a-time is far more reliable;
 * total time is similar because failed parallel calls were retrying anyway.
 */
export async function askAll(
  personas: Persona[],
  prompt: string,
  verify = true,
): Promise<PersonaAnswer[]> {
  const out: PersonaAnswer[] = [];
  for (const p of personas) {
    out.push(await askPersona(p, prompt, verify));
  }
  return out;
}
