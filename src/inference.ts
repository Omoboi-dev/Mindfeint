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

/**
 * Ask one persona, retrying a couple of times. The 0G provider can blip (auto-funding,
 * nonce collisions when calls fire together, cold starts), so a single attempt isn't
 * reliable — we retry on empty/failed answers and only then fall back to a safe line.
 */
export async function askPersona(
  persona: Persona,
  prompt: string,
  verify = true,
): Promise<PersonaAnswer> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(600 * attempt);
    const out = await askPersonaOnce(persona, prompt, verify);
    if (out) return out;
  }
  return { text: "idk honestly, never really thought about it" };
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

  let verified: boolean | undefined;
  if (verify && chatId) {
    try {
      const usage = data?.usage ? JSON.stringify(data.usage) : undefined;
      const ok = await Promise.race<boolean | null>([
        broker.inference.processResponse(provider, chatId, usage),
        new Promise<null>((r) => setTimeout(() => r(null), 12000)),
      ]);
      verified = ok ?? undefined;
    } catch {
      verified = false;
    }
  }

  return { text, verified, chatId };
}

/**
 * Ask many personas near-parallel, but staggered by a few hundred ms so their signed
 * requests don't collide on the provider (which was causing empty responses).
 */
export function askAll(
  personas: Persona[],
  prompt: string,
  verify = true,
): Promise<PersonaAnswer[]> {
  return Promise.all(
    personas.map(async (p, i) => {
      await sleep(i * 350);
      return askPersona(p, prompt, verify);
    }),
  );
}
