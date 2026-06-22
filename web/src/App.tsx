/**
 * MINDFEINT — app shell + flow orchestration.
 * OWNER: Dev A (game/frontend). Lobby → Arena → Reveal.
 */
import { useEffect, useState } from "react";
import { getPacks, startRound, vote } from "./api.js";
import { Arena } from "./components/Arena.js";
import { Reveal as RevealView } from "./components/Reveal.js";
import type { Pack, PublicRound, Reveal } from "./types.js";

type Phase = "lobby" | "loading" | "arena" | "reveal";

export default function App() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [pack, setPack] = useState("spicy");
  const [round, setRound] = useState<PublicRound | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPacks().then(setPacks).catch(() => setPacks([{ id: "spicy", title: "Spicy Takes" }]));
  }, []);

  async function begin() {
    setError(null);
    setPhase("loading");
    try {
      setRound(await startRound(pack));
      setPhase("arena");
    } catch (e: any) {
      setError(e.message);
      setPhase("lobby");
    }
  }

  async function castVote(seat: number) {
    if (!round) return;
    try {
      setReveal(await vote(round.id, seat));
      setPhase("reveal");
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">MINDFEINT</h1>
        <span className="tag">one of them is a real person. the rest are provably-real AIs.</span>
      </header>

      {phase === "lobby" && (
        <div className="lobby">
          <h2>Can you spot the human?</h2>
          <p className="sub">
            Six answers to one prompt. Five are AIs trying to pass as human — each one
            <b> provably a real model</b>, verified on 0G. One is an actual person. Find them.
          </p>
          <div className="packs">
            {packs.map((p) => (
              <button
                key={p.id}
                className={`pack ${pack === p.id ? "on" : ""}`}
                onClick={() => setPack(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>
          <button className="cta" onClick={begin}>Start a round</button>
          {error && <p className="err">{error}</p>}
        </div>
      )}

      {phase === "loading" && (
        <div className="loading">
          <div className="spinner" />
          <p>Assembling the table… five minds are answering on 0G.</p>
        </div>
      )}

      {phase === "arena" && round && <Arena round={round} onVote={castVote} />}

      {phase === "reveal" && reveal && (
        <RevealView reveal={reveal} onAgain={() => setPhase("lobby")} />
      )}
    </div>
  );
}
