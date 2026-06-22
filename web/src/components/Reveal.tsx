/**
 * MINDFEINT — reveal + verdict card (the shareable, provable moment).
 * OWNER: shared seam — Dev A owns the reveal layout; Dev B owns the proof badges
 * and the 0G storage link (the "provably fair" surface).
 */
import type { Reveal } from "../types.js";

const STORAGE_BASE = "https://storagescan-galileo.0g.ai/tx/";
const CHAIN_BASE = "https://chainscan-galileo.0g.ai/tx/";

export function Reveal({ reveal, onAgain }: { reveal: Reveal; onAgain: () => void }) {
  return (
    <div className="reveal">
      <h2 className={reveal.correct ? "win" : "lose"}>
        {reveal.correct ? "Got them. That was the human." : "Fooled. That one was an AI."}
      </h2>

      <div className="results">
        {reveal.answers.map((a) => {
          const isGuess = a.seat === reveal.guessedSeat;
          const isHuman = a.seat === reveal.humanSeat;
          return (
            <div
              key={a.seat}
              className={`result ${isHuman ? "human" : "ai"} ${isGuess ? "guessed" : ""}`}
            >
              <div className="result-head">
                <span>Seat {a.seat + 1}</span>
                <span className="badge">
                  {isHuman ? "🧑 HUMAN" : a.verified ? "🤖 AI · ✓ 0G" : "🤖 AI"}
                </span>
              </div>
              <p>{a.text}</p>
            </div>
          );
        })}
      </div>

      {/* DEV B: proof surface — the "provably fair" payoff */}
      <div className="proof">
        <span>🛡️ {reveal.verifiedCount} AI answers verified on 0G</span>
        {reveal.storageRoot && (
          <a href={`${STORAGE_BASE}${reveal.storageRoot}`} target="_blank" rel="noreferrer">
            📦 View this round on 0G Storage · {reveal.storageRoot.slice(0, 12)}…
          </a>
        )}
        {reveal.chainTx && (
          <a href={`${CHAIN_BASE}${reveal.chainTx}`} target="_blank" rel="noreferrer">
            ⛓️ Attested on 0G Chain · {reveal.chainTx.slice(0, 12)}…
          </a>
        )}
      </div>

      <button className="cta" onClick={onAgain}>Play another round</button>
    </div>
  );
}
