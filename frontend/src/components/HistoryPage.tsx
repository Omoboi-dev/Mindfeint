/**
 * MINDFEINT — HistoryPage
 * Full round history browser. "0G Neural Dark" design language.
 * Glassmorphism cards · staggered motion · count-up stat strip · color-coded entries.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History as HistoryIcon,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
  Target,
  Crosshair,
  BarChart3,
} from "lucide-react";
import type { GameHistoryEntry, PlayerStats } from "../types";

/* ─── tiny count-up hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

/* ─── Animated stat card ─────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  accentClass: string; // text color for icon + value
  delay?: number;
}

function StatCard({ label, value, suffix = "", icon, accentClass, delay = 0 }: StatCardProps) {
  const displayed = useCountUp(value, 900);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1 relative overflow-hidden group"
    >
      {/* subtle radial glow behind icon */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,127,255,0.08) 0%, transparent 70%)" }} />

      <span className={`mb-1 ${accentClass}`}>{icon}</span>
      <span className={`text-2xl font-black font-mono tracking-tight ${accentClass}`}>
        {displayed}{suffix}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">{label}</span>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
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
  const accuracy = stats.roundsPlayed > 0
    ? Math.round((stats.humansSpotted / stats.roundsPlayed) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full">

      {/* ── Page header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-4"
      >
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="shrink-0 glass-card hover:bg-white/[0.06] text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer transition-all border border-white/10 hover:border-brand-violet/40"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2 truncate">
            <HistoryIcon className="w-6 h-6 text-brand-violet shrink-0" />
            Round History
          </h1>
        </div>

        {/* Right: clear button (only when there is history) */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.button
              key="clear-btn"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={onClear}
              className="shrink-0 flex items-center gap-1.5 text-text-muted hover:text-brand-red font-mono text-[11px] uppercase tracking-wider cursor-pointer transition-colors border border-white/8 hover:border-brand-red/30 px-3 py-1.5 rounded-lg hover:bg-brand-red/5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear All
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Summary stat strip ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Rounds"
          value={stats.roundsPlayed}
          icon={<BarChart3 className="w-5 h-5" />}
          accentClass="text-brand-violet"
          delay={0.05}
        />
        <StatCard
          label="Spotted"
          value={stats.humansSpotted}
          icon={<Crosshair className="w-5 h-5" />}
          accentClass="text-brand-green"
          delay={0.10}
        />
        <StatCard
          label="Accuracy"
          value={accuracy}
          suffix="%"
          icon={<Target className="w-5 h-5" />}
          accentClass="text-brand-cyan"
          delay={0.15}
        />
      </div>

      {/* ── History list / empty state ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {history.length === 0 ? (
          /* Empty state */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 py-20 glass-card rounded-2xl border border-dashed border-white/8"
          >
            <AlertCircle className="w-12 h-12 text-text-muted" />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-white/60 font-display">No rounds yet</p>
              <p className="text-xs text-text-muted font-mono max-w-[260px] leading-relaxed">
                Complete a Detector round and your results will appear here.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Populated list */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {history.map((entry, index) => (
              <HistoryItem key={entry.roundId + index} entry={entry} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Individual history row ─────────────────────────────────────── */
function HistoryItem({ entry, index }: { entry: GameHistoryEntry; index: number }) {
  const isCorrect = entry.correct;
  const txUrl = entry.storageTx
    ? `https://chainscan-galileo.0g.ai/tx/${entry.storageTx}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: "easeOut" }}
      className={[
        "glass-card p-4 rounded-xl",
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
        "border-l-4",
        isCorrect ? "border-l-brand-green" : "border-l-brand-red",
        // override glass-card's uniform border-radius on left to let border-l show
        "rounded-l-none",
      ].join(" ")}
    >
      {/* ── Left: prompt + meta ─────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
          {entry.prompt}
        </p>
        <p className="text-text-muted text-xs font-mono mt-1">
          Guess: Seat {entry.guessedSeat + 1}
          <span className="mx-1 opacity-40">·</span>
          Human: Seat {entry.humanSeat + 1}
          <span className="mx-1 opacity-40">·</span>
          <span className="opacity-60">{entry.timestamp}</span>
        </p>
      </div>

      {/* ── Right: verdict badge + 0G link ──────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* SPOTTED / FOOLED pill */}
        {isCorrect ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black font-mono uppercase tracking-widest
            bg-brand-green/15 border border-brand-green/40 text-brand-green
            px-2.5 py-1 rounded-full">
            ✓ Spotted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-black font-mono uppercase tracking-widest
            bg-brand-red/12 border border-brand-red/35 text-brand-red
            px-2.5 py-1 rounded-full">
            ✕ Fooled
          </span>
        )}

        {/* 0G on-chain link */}
        {txUrl ? (
          <a
            href={txUrl}
            target="_blank"
            rel="noreferrer"
            title="View this round's record on 0G"
            className="inline-flex items-center gap-1 text-[10px] font-black font-mono uppercase tracking-wider
              bg-brand-violet/10 border border-brand-violet/30 text-brand-violet
              hover:bg-brand-violet/20 hover:text-white hover:border-brand-violet/60
              px-2.5 py-1 rounded-full transition-all cursor-pointer"
          >
            0G <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          <span
            title="Round not stored on-chain"
            className="text-[10px] text-text-muted font-mono px-1.5 select-none"
          >
            —
          </span>
        )}
      </div>
    </motion.div>
  );
}
