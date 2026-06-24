/**
 * Roadmap.tsx — 3D Spatial Journey roadmap for Mindfeint.
 *
 * A vertical timeline rendered as a glowing rail through deep space.
 * Milestones are floating glass stations that scale and fade in as they
 * enter the viewport, giving the illusion of forward camera travel.
 *
 * Pure CSS perspective + Framer Motion scroll hooks — no Three.js.
 */

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowLeft, CheckCircle2, Circle, Clock, Zap, Database, Globe, Shield, Users, Smartphone, Lock, Trophy, Rocket, Cpu } from "lucide-react";

interface RoadmapProps {
  onBack: () => void;
}

type MilestoneStatus = "live" | "active" | "planned";

interface Milestone {
  phase: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  date: string;
  tech: string[];
  icon: React.ReactNode;
}

const MILESTONES: Milestone[] = [
  {
    phase: "GENESIS",
    title: "Concept & Architecture",
    description: "Mindfeint designed as the world's first provably-fair AI social deduction game. Core game loop, backend architecture, and 0G integration strategy locked.",
    status: "live",
    date: "Q2 2026",
    tech: ["Node.js", "TypeScript", "0G Protocol"],
    icon: <Zap className="w-5 h-5" />,
  },
  {
    phase: "TESTNET LIVE",
    title: "Deployed on 0G Galileo",
    description: "Full game loop live on the 0G Galileo testnet. Real rounds playable end-to-end with working AI inference pipeline and player sessions.",
    status: "live",
    date: "Q2 2026",
    tech: ["0G Galileo", "Cloudflare Workers", "Vite + React"],
    icon: <Globe className="w-5 h-5" />,
  },
  {
    phase: "VERIFIABLE AI",
    title: "0G Compute + TEE Attestation",
    description: "Every AI-generated answer is produced by a real model on 0G's verifiable inference stack and signed inside a Trusted Execution Environment. Provably untampered.",
    status: "live",
    date: "Q2 2026",
    tech: ["0G Compute", "TEE Attestation", "qwen2.5-omni-7b"],
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    phase: "ON-CHAIN PROOF",
    title: "0G Storage + Chain Anchoring",
    description: "Every round is recorded immutably to 0G Storage and anchored via attestation transaction on 0G Chain. Any player can independently verify any result.",
    status: "live",
    date: "Q2 2026",
    tech: ["0G Storage", "0G Chain", "EIP-712 Signatures"],
    icon: <Database className="w-5 h-5" />,
  },
  {
    phase: "IDENTITY LAYER",
    title: "Google Auth + ERC-4337 Wallets",
    description: "Players sign in with Google. Each account gets a gasless Kernel ERC-4337 smart wallet provisioned automatically via ZeroDev — no seed phrases, no friction.",
    status: "live",
    date: "Q2 2026",
    tech: ["Firebase Auth", "ZeroDev", "ERC-4337 Kernel v3"],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    phase: "COMPETITION",
    title: "Global Leaderboard & Rankings",
    description: "Persistent on-chain leaderboards tracking accuracy streaks, total humans spotted, and season rankings. Compete globally with your smart wallet identity.",
    status: "active",
    date: "Q3 2026",
    tech: ["0G Chain", "Smart Contracts", "Global State"],
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    phase: "MOBILE NATIVE",
    title: "Mobile-First Experience",
    description: "Full PWA with native gesture controls, haptic feedback on reveals, and an optimised mobile layout that makes the detective experience feel native on any device.",
    status: "active",
    date: "Q3 2026",
    tech: ["PWA", "Service Workers", "Touch APIs"],
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    phase: "TOKEN GATES",
    title: "Premium Prompt Pack Access",
    description: "Exclusive prompt packs (NSFW, Philosophy, Ultra-hard) gated behind token holdings. Community-created packs submitted and voted on via governance.",
    status: "planned",
    date: "Q4 2026",
    tech: ["ERC-20", "Token Gating", "Governance"],
    icon: <Lock className="w-5 h-5" />,
  },
  {
    phase: "SEASONS",
    title: "PvP Competitive Seasons",
    description: "Head-to-head arena mode. Two players each make a guess on the same round simultaneously. On-chain wagering, seasonal reset, and badge rewards for top players.",
    status: "planned",
    date: "Q4 2026",
    tech: ["Smart Contracts", "Real-time PvP", "On-chain Wagering"],
    icon: <Users className="w-5 h-5" />,
  },
  {
    phase: "MAINNET",
    title: "0G Mainnet Deployment",
    description: "Migrate from Galileo testnet to 0G Mainnet. Full production deployment with real asset wagering, enterprise-grade uptime, and the complete verified AI gaming stack.",
    status: "planned",
    date: "2027",
    tech: ["0G Mainnet", "Production Deploy", "Real Assets"],
    icon: <Rocket className="w-5 h-5" />,
  },
];

const statusConfig = {
  live: {
    label: "LIVE",
    labelClass: "text-brand-green bg-brand-green/15 border border-brand-green/30",
    dotClass: "bg-brand-green shadow-[0_0_8px_rgba(0,245,160,0.8)]",
    cardClass: "milestone-live",
    iconBg: "bg-brand-green/15 border-brand-green/30 text-brand-green",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  active: {
    label: "IN PROGRESS",
    labelClass: "text-brand-violet bg-brand-violet/15 border border-brand-violet/30",
    dotClass: "bg-brand-violet shadow-[0_0_8px_rgba(139,127,255,0.8)] animate-pulse",
    cardClass: "milestone-active",
    iconBg: "bg-brand-violet/15 border-brand-violet/30 text-brand-violet",
    icon: <Clock className="w-4 h-4 animate-pulse" />,
  },
  planned: {
    label: "PLANNED",
    labelClass: "text-text-muted bg-white/5 border border-white/10",
    dotClass: "bg-white/20",
    cardClass: "milestone-planned",
    iconBg: "bg-white/5 border-white/10 text-text-muted",
    icon: <Circle className="w-4 h-4" />,
  },
};

function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isLeft = index % 2 === 0;
  const cfg = statusConfig[milestone.status];

  return (
    <div ref={ref} className={`relative flex items-start gap-0 pl-12 md:pl-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40, scale: 0.92 }}
        animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className={`w-full md:w-[calc(50%-2rem)] glass-card ${cfg.cardClass} p-6 rounded-2xl relative overflow-hidden group`}
        style={{ perspective: "1000px" }}
      >
        {/* Corner neural grid */}
        <div className="absolute inset-0 neural-grid opacity-20 rounded-2xl pointer-events-none" />

        {/* Phase label */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full ${cfg.labelClass}`}>
            {cfg.icon}
            <span className="ml-1.5">{cfg.label}</span>
          </span>
          <span className="text-[10px] font-mono text-text-muted">{milestone.date}</span>
        </div>

        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
            {milestone.icon}
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-[0.15em] text-text-muted uppercase mb-0.5">
              {milestone.phase}
            </p>
            <h3 className="text-base font-bold font-display text-white leading-tight">
              {milestone.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {milestone.description}
        </p>

        {/* Tech pills */}
        <div className="flex flex-wrap gap-1.5">
          {milestone.tech.map((t) => (
            <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-text-muted">
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Center connector to rail (desktop only) */}
      <div className={`hidden md:flex w-8 flex-shrink-0 ${isLeft ? "justify-end" : "justify-start"} items-center pt-8`}>
        <div className="w-8 h-px bg-white/10" />
      </div>

      {/* Spacer for other side (desktop only) */}
      <div className="hidden md:block w-[calc(50%-2rem)]" />
    </div>
  );
}

export default function Roadmap({ onBack }: RoadmapProps) {
  const liveCount = MILESTONES.filter((m) => m.status === "live").length;
  const activeCount = MILESTONES.filter((m) => m.status === "active").length;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-12" id="roadmap-page">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-brand-violet/40 text-text-secondary hover:text-white p-2 rounded-lg cursor-pointer transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[10px] font-mono tracking-[0.2em] text-text-muted uppercase mb-1">Development Journey</p>
            <h1 className="text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-none">
              Roadmap
            </h1>
            <p className="text-text-secondary mt-2 text-sm max-w-md leading-relaxed">
              From genesis to mainnet — every milestone on the path to the world's most verifiable AI game.
            </p>
          </div>
        </div>

        {/* Status summary */}
        <div className="hidden md:flex flex-col gap-2 text-right flex-shrink-0">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_6px_rgba(0,245,160,0.8)]" />
            <span className="text-xs font-mono text-brand-green font-bold">{liveCount} LIVE</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-brand-violet animate-pulse shadow-[0_0_6px_rgba(139,127,255,0.8)]" />
            <span className="text-xs font-mono text-brand-violet font-bold">{activeCount} IN PROGRESS</span>
          </div>
        </div>
      </div>

      {/* ── 3D Spatial Timeline ── */}
      <div className="relative">
        {/* The glowing rail — left on mobile, centered on desktop */}
        <div className="absolute left-5 md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 rail-glow rounded-full" />

        {/* Dot markers on the rail */}
        <div className="absolute left-5 md:left-1/2 -translate-x-1/2 top-0 bottom-0 flex flex-col">
          {MILESTONES.map((m, i) => {
            const cfg = statusConfig[m.status];
            return (
              <div
                key={i}
                className="relative flex-1 flex items-center justify-center"
                style={{ minHeight: "200px" }}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-dark-bg z-10 ${cfg.dotClass}`} />
              </div>
            );
          })}
        </div>

        {/* Milestone cards */}
        <div className="space-y-0">
          {MILESTONES.map((milestone, index) => (
            <div key={index} style={{ minHeight: "200px" }} className="flex items-center">
              <MilestoneCard milestone={milestone} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer call to action ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8 rounded-2xl text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 neural-grid-cyan opacity-20 pointer-events-none rounded-2xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-brand-cyan/60 to-transparent" />

        <Rocket className="w-8 h-8 text-brand-cyan mx-auto mb-4" />
        <h3 className="text-xl font-bold font-display text-white mb-2">The Journey Continues</h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
          Built on 0G — the only AI infrastructure that lets a game prove its AIs are genuine.
          Every feature ships on-chain, every round is verifiable forever.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            0G GALILEO TESTNET
          </span>
          <span>·</span>
          <span>TEE-ATTESTED INFERENCE</span>
          <span>·</span>
          <span>ERC-4337 WALLETS</span>
          <span>·</span>
          <span>OPEN VERIFIABLE ROUNDS</span>
        </div>
      </motion.div>
    </div>
  );
}
