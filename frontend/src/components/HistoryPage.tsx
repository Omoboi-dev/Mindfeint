/**
 * MINDFEINT — full round history, on its own page so it's easy to browse.
 * Each entry links to its on-chain record on 0G.
 */
import { History as HistoryIcon, ExternalLink, RotateCcw, AlertCircle, ArrowLeft } from "lucide-react";
import type { GameHistoryEntry, PlayerStats } from "../types";

export default function HistoryPage({
  history,
  stats,
  onClear,
  onBack,
}: {
  history: GameHistoryEntry[];
  stats: PlayerStats;
  onClear: () => void;
  onBack: () => void;
}) {
  const accuracy = stats.roundsPlayed > 0 ? Math.round((stats.humansSpotted / stats.roundsPlayed) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white p-2 rounded-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-7 h-7 text-brand-violet" /> Round History
          </h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-red-400 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Rounds", value: stats.roundsPlayed },
          { label: "Spotted", value: stats.humansSpotted },
          { label: "Accuracy", value: `${accuracy}%` },
        ].map((s) => (
          <div key={s.label} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold font-mono text-white">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* History list */}
      {history.length === 0 ? (
        <div className="text-gray-500 text-center py-16 text-sm bg-dark-bg/50 border border-dashed border-dark-border rounded-2xl flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6 text-gray-600" />
          <span>No rounds played yet. Spot some humans and they'll show up here.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, idx) => (
            <div
              key={idx}
              className={`bg-dark-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                entry.correct ? "border-brand-green/30" : "border-red-500/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white font-sans leading-snug">{entry.prompt}</p>
                <p className="text-xs text-gray-400 font-mono mt-1.5">
                  Guess: Seat {entry.guessedSeat + 1} · Human: Seat {entry.humanSeat + 1}
                  <span className="text-gray-600"> · {entry.timestamp}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {entry.correct ? (
                  <span className="text-[11px] bg-brand-green/20 border border-brand-green/45 text-brand-green px-2.5 py-1 rounded-lg uppercase font-bold tracking-widest">
                    Spotted
                  </span>
                ) : (
                  <span className="text-[11px] bg-red-500/15 border border-red-500/35 text-red-400 px-2.5 py-1 rounded-lg uppercase font-bold tracking-widest">
                    Fooled
                  </span>
                )}
                {entry.storageTx ? (
                  <a
                    href={`https://chainscan-galileo.0g.ai/tx/${entry.storageTx}`}
                    target="_blank"
                    rel="noreferrer"
                    title="View this round's record on 0G"
                    className="text-[11px] flex items-center gap-1 bg-brand-violet/10 border border-brand-violet/30 text-brand-violet hover:text-white px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider transition-colors"
                  >
                    0G <ExternalLink className="w-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-600 px-2" title="Not stored on-chain">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
