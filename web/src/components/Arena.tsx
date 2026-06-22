/**
 * MINDFEINT — the table: read 6 answers, pick the human.
 * OWNER: Dev A (game/frontend).
 */
import { useState } from "react";
import type { PublicRound } from "../types.js";

export function Arena({ round, onVote }: { round: PublicRound; onVote: (seat: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="arena">
      <div className="prompt-card">
        <span className="kicker">PROMPT</span>
        <p className="prompt">{round.prompt}</p>
      </div>

      <p className="instruct">Tap the seat you think is the <b>real human</b>.</p>

      <div className="table">
        {round.seats.map((s) => (
          <button
            key={s.seat}
            className={`seat ${picked === s.seat ? "picked" : ""}`}
            onClick={() => setPicked(s.seat)}
          >
            <span className="seat-no">Seat {s.seat + 1}</span>
            <span className="seat-text">{s.text}</span>
          </button>
        ))}
      </div>

      <button className="cta" disabled={picked === null} onClick={() => onVote(picked!)}>
        {picked === null ? "Pick a seat" : `Lock in Seat ${picked + 1}`}
      </button>
    </div>
  );
}
