import { TrendingUp, Flame, ThumbsUp, Award, RotateCcw, History, ArrowRight } from "lucide-react";
import { PlayerStats } from "../types";

interface HistoryStatsProps {
  stats: PlayerStats;
  onResetStats: () => void;
  onViewHistory: () => void;
}

export default function HistoryStats({ stats, onResetStats, onViewHistory }: HistoryStatsProps) {
  const successRate = stats.roundsPlayed > 0
    ? Math.round((stats.humansSpotted / stats.roundsPlayed) * 100)
    : 0;

  return (
    <div className="w-full bg-dark-card border border-dark-border rounded-xl p-5" id="history-stats">
      <div className="flex justify-between items-center pb-3 border-b border-dark-border mb-4">
        <h3 className="text-sm font-semibold font-display tracking-wide text-white uppercase flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-violet" /> Diagnostics & Streaks
        </h3>
        <button
          onClick={onResetStats}
          title="Reset statistics"
          className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-dark-bg transition-all cursor-pointer font-mono text-[10px] flex items-center gap-1 uppercase"
        >
          <RotateCcw className="w-3" /> Reset
        </button>
      </div>

      {/* Grid of scorecard stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-dark-bg p-3 border border-dark-border/40 rounded-lg text-center relative overflow-hidden">
          <div className="absolute top-1 left-1 flex items-center text-orange-400 gap-0.5">
            <Flame className="w-3 h-3 fill-current" />
          </div>
          <span className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-widest block">
            Current streak
          </span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {stats.currentStreak} <span className="text-xs text-gray-500">rnd</span>
          </span>
        </div>

        <div className="bg-dark-bg p-3 border border-dark-border/40 rounded-lg text-center relative overflow-hidden">
          <div className="absolute top-1 left-1 text-yellow-500">
            <Award className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-widest block">
            Highest streak
          </span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {stats.highestStreak} <span className="text-xs text-gray-500">max</span>
          </span>
        </div>

        <div className="bg-dark-bg p-3 border border-dark-border/40 rounded-lg text-center relative overflow-hidden">
          <div className="absolute top-1 left-1 text-brand-green">
            <ThumbsUp className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-widest block">
            Humans Spotted
          </span>
          <span className="text-xl font-bold font-mono text-brand-green mt-1 block">
            {stats.humansSpotted} <span className="text-xs text-gray-500">/ {stats.roundsPlayed}</span>
          </span>
        </div>

        <div className="bg-dark-bg p-3 border border-dark-border/40 rounded-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-widest block">
            Success Acc
          </span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {successRate}%
          </span>
        </div>
      </div>

      {/* Link to the full history page */}
      <button
        onClick={onViewHistory}
        className="w-full flex items-center justify-center gap-2 bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider py-2.5 rounded-lg cursor-pointer transition-colors"
      >
        <History className="w-3.5 text-brand-violet" /> View round history <ArrowRight className="w-3.5" />
      </button>
    </div>
  );
}
