/**
 * MINDFEINT — How to Play page.
 * Redesigned: 0G Neural Dark, glassmorphism cards, CSS 3D tilt, motion/react CTA.
 */
import { useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────── */
interface HowToPlayProps {
  onBack: () => void;
  onPlay: () => void;
}

/* ─── 3-D tilt card hook ─────────────────────────────────────────────── */
function useTiltCard(maxDeg = 8) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;   // −0.5 → +0.5
    const y = (e.clientY - top) / height - 0.5;
    const rotateX = (-y * maxDeg).toFixed(2);
    const rotateY = (x * maxDeg).toFixed(2);
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const onMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return { ref, onMouseMove, onMouseLeave };
}

/* ─── Mode card ──────────────────────────────────────────────────────── */
interface ModeCardProps {
  accentClass: string;
  bgClass: string;
  borderClass: string;
  glowClass: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
  badgeBg: string;
  steps: string[];
}

function ModeCard({
  accentClass,
  bgClass,
  borderClass,
  glowClass,
  icon,
  title,
  badge,
  badgeBg,
  steps,
}: ModeCardProps) {
  const tilt = useTiltCard(8);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={`glass-card perspective-card p-7 rounded-2xl ${glowClass} group cursor-default`}
      style={{ transition: "transform 0.18s ease-out, box-shadow 0.18s ease-out" }}
    >
      {/* Icon + badge row */}
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-xl ${bgClass} border ${borderClass} flex items-center justify-center ${accentClass} shrink-0`}
        >
          {icon}
        </div>
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeBg} ${accentClass} border ${borderClass}`}
        >
          {badge}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-xl font-bold text-text-primary mb-4 tracking-tight">
        {title}
      </h3>

      {/* Numbered steps */}
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={`shrink-0 w-6 h-6 rounded-full ${bgClass} border ${borderClass} ${accentClass} font-mono text-xs font-bold flex items-center justify-center leading-none mt-0.5`}
            >
              {i + 1}
            </span>
            <span className="text-sm text-text-secondary leading-relaxed">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─── Tech badge ─────────────────────────────────────────────────────── */
interface TechBadgeProps {
  label: string;
  dotClass: string;
}
function TechBadge({ label, dotClass }: TechBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
        {label}
      </span>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function HowToPlay({ onBack, onPlay }: HowToPlayProps) {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="bg-white/5 border border-white/8 hover:border-brand-violet/40 hover:bg-white/10 text-text-secondary hover:text-text-primary p-2 rounded-lg cursor-pointer transition-all duration-200 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          How to Play
        </h1>
      </div>

      {/* ── Tagline ── */}
      <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
        Every round serves a table of{" "}
        <strong className="text-text-primary font-semibold">6 answers</strong>{" "}
        to one prompt. Five are written by AI personas;{" "}
        <strong className="text-text-primary font-semibold">
          one is a real person
        </strong>
        . Your job is to tell them apart — or blend in and fool everyone else.
      </p>

      {/* ── Mode cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModeCard
          accentClass="text-brand-violet"
          bgClass="bg-brand-violet/10"
          borderClass="border-brand-violet/20"
          glowClass="glow-violet"
          icon={<Eye className="w-6 h-6" />}
          title="Detector Mode"
          badge="Hunt the human"
          badgeBg="bg-brand-violet/10"
          steps={[
            "Read all 6 anonymised answers carefully.",
            "Pick the seat you think belongs to the real human.",
            "Lock it in — then watch the 0G on-chain proof reveal who was who.",
          ]}
        />
        <ModeCard
          accentClass="text-brand-green"
          bgClass="bg-brand-green/10"
          borderClass="border-brand-green/20"
          glowClass="glow-green"
          icon={<UserCheck className="w-6 h-6" />}
          title="Hider Mode"
          badge="Blend in"
          badgeBg="bg-brand-green/10"
          steps={[
            "You're the human. Write your answer to the prompt.",
            "Mimic the tone of the AI personas — don't stand out.",
            "Your response gets shuffled into other players' rounds to fool them.",
          ]}
        />
      </div>

      {/* ── Provably fair section ── */}
      <div className="glass-card p-6 rounded-2xl border border-brand-violet/20">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-text-primary mb-1">
              Why it&apos;s provably fair
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every AI answer is produced by a real model on{" "}
              <strong className="text-text-primary font-semibold">
                0G verifiable inference
              </strong>{" "}
              and signed inside a TEE — so no one can fake a bot or rig the
              result. Each round is recorded on 0G Storage and anchored on 0G
              Chain, and you can open the on-chain proof directly from any
              reveal screen.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/8 mb-4" />

        {/* Tech badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-text-muted uppercase tracking-widest mr-1">
            Powered by
          </span>
          <TechBadge label="0G Compute" dotClass="bg-brand-violet" />
          <TechBadge label="0G Storage" dotClass="bg-brand-cyan" />
          <TechBadge label="0G Chain"   dotClass="bg-brand-green" />
        </div>
      </div>

      {/* ── CTA button ── */}
      <motion.button
        onClick={onPlay}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-mono font-bold uppercase tracking-wider px-8 py-4 rounded-xl shadow-2xl cursor-pointer glow-violet"
      >
        <span>Start playing</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
