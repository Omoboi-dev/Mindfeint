import type { Pack, PublicRound, Reveal } from "./types.js";

export async function getPacks(): Promise<Pack[]> {
  const r = await fetch("/api/packs");
  if (!r.ok) throw new Error("Failed to load packs");
  return r.json();
}

export async function startRound(pack: string): Promise<PublicRound> {
  const r = await fetch("/api/round", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pack }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Could not start round");
  return r.json();
}

export async function vote(roundId: string, seat: number, voterId = "anon"): Promise<Reveal> {
  const r = await fetch(`/api/round/${roundId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seat, voterId }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Vote failed");
  return r.json();
}

export async function hide(pack: string, text: string): Promise<{ prompt: string }> {
  const r = await fetch("/api/hide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pack, text }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Submit failed");
  return r.json();
}
