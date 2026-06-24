import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Flame,
  Award,
  ThumbsUp,
  RotateCcw,
  History,
  ChevronRight,
} from "lucide-react";
import { PlayerStats } from "../types";

interface HistoryStatsProps {
  stats: PlayerStats;
  onResetStats: () => void;
  onViewHistory: () => void;
}

/* ─── Animated count-up hook ────────────────────────────────────────────── */
function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}

/* ─── Individual stat card ──────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  icon: React.ReactNode;
  displayValue: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  delay?: number;
}

function StatCard({
  label,
  icon,
  displayValue,
  extra,
  className = "",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={[
        "relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]",
        "backdrop-blur-sm p-4 flex flex-col items-center justify-center gap-1 text-center",
        "transition-shadow duration-300",
        className,
      ].join(" ")}
    >
      {/* icon badge — top-left */}
      <span className="absolute top-2 left-2.5 opacity-80">{icon}</span>

      {/* label */}
      <span className="text-[9px] font-mono font-semibold tracking-[0.18em] text-text-muted uppercase mt-3">
        {label}
      </span>

      {/* main value */}
      <div className="font-mono font-bold text-2xl leading-none">{displayValue}</div>

      {/* optional sub-label */}
      {extra && (
        <span className="text-[10px] font-mono text-text-muted">{extra}</span>
      )}
    </motion.div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function HistoryStats({ stats, onResetStats, onViewHistory }: HistoryStatsProps) {
  const successRate =
    stats.roundsPlayed > 0
      ? Math.round((stats.humansSpotted / stats.roundsPlayed) * 100)
      : 0;

  /* animated count-up values */
  const animStreak  = useCountUp(stats.currentStreak);
  const animHighest = useCountUp(stats.highestStreak);
  const animSpotted = useCountUp(stats.humansSpotted);
  const animRate    = useCountUp(successRate);

  /* success-rate colour */
  const rateColour =
    successRate > 60
      ? "text-brand-green"
      : successRate < 40
      ? "text-brand-red"
      : "text-white";

  /* personal-best border highlight */
  const isPersonalBest =
    stats.highestStreak > 0 && stats.highestStreak === stats.currentStreak;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6 rounded-2xl w-full"
      id="history-stats"
    >
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.2em] text-white uppercase">
          <TrendingUp className="w-4 h-4 text-brand-violet shrink-0" />
          Diagnostics &amp; Streaks
        </h3>

        <button
          onClick={onResetStats}
          title="Reset statistics"
          className="text-text-muted hover:text-brand-red text-xs font-mono flex items-center gap-1 transition-colors duration-200 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* ── Stat cards grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Current Streak */}
        <StatCard
          delay={0.05}
          label="Current Streak"
          icon={
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
          }
          displayValue={
            <span className="text-white">
              {animStreak}
              <span className="text-[11px] font-normal text-text-muted ml-1">
                rnd
              </span>
            </span>
          }
          className={
            stats.currentStreak > 0
              ? "shadow-[0_0_20px_rgba(245,158,11,0.2)] border-orange-500/20"
              : ""
          }
        />

        {/* Highest Streak */}
        <StatCard
          delay={0.1}
          label="Highest Streak"
          icon={<Award className="w-3.5 h-3.5 text-yellow-400" />}
          displayValue={
            <span className="text-white">
              {animHighest}
              <span className="text-[11px] font-normal text-text-muted ml-1">
                max
              </span>
            </span>
          }
          className={isPersonalBest ? "border-brand-amber/40" : ""}
        />

        {/* Humans Spotted */}
        <StatCard
          delay={0.15}
          label="Humans Spotted"
          icon={<ThumbsUp className="w-3.5 h-3.5 text-brand-green" />}
          displayValue={
            <span className="text-brand-green">{animSpotted}</span>
          }
          extra={`/ ${stats.roundsPlayed} rounds`}
        />

        {/* Success Rate */}
        <StatCard
          delay={0.2}
          label="Success Rate"
          icon={
            <span className="text-[9px] font-mono text-text-muted tracking-widest">
              ACC
            </span>
          }
          displayValue={<span className={rateColour}>{animRate}%</span>}
        />
      </div>

      {/* ── View History button ──────────────────────────────────────────── */}
      <motion.button
        onClick={onViewHistory}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="w-full mt-4 glass-card hover:border-brand-violet/40 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-sm uppercase text-text-secondary hover:text-white transition-all duration-200 cursor-pointer"
      >
        <History className="w-4 h-4 text-brand-violet shrink-0" />
        View Round History
        <ChevronRight className="w-4 h-4 opacity-60" />
      </motion.button>
    </motion.div>
  );
}
