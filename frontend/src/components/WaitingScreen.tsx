import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Zap } from "lucide-react";

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface WaitingScreenProps {
  prompt: string;
  packName: string;
  onCancel?: () => void;
}

/* ─── Telemetry data — IDENTICAL to original ────────────────────────────── */
const DECENTRALIZED_LOGS = [
  { text: "⚡ Connecting to 0G Compute provider (qwen2.5-omni-7b)...", type: "system" },
  { text: "📡 Acknowledging provider signer on 0G Galileo...", type: "system" },
  { text: "🤖 Dispatching inference request — persona 1...", type: "alpha" },
  { text: "🤖 Dispatching inference request — persona 2...", type: "beta" },
  { text: "🤖 Dispatching inference request — persona 3...", type: "gamma" },
  { text: "🤖 Dispatching inference request — persona 4...", type: "delta" },
  { text: "🤖 Dispatching inference request — persona 5...", type: "epsilon" },
  { text: "📁 Pulling human seat from the live answer pool...", type: "human" },
  { text: "🧠 persona 3 responded — verifying TEE signature...", type: "gamma" },
  { text: "🧠 persona 1 responded — verifying TEE signature...", type: "alpha" },
  { text: "✨ TEE attestation OK for persona 3.", type: "gamma" },
  { text: "✨ TEE attestation OK for persona 1.", type: "alpha" },
  { text: "🧠 persona 5 responded — verifying TEE signature...", type: "epsilon" },
  { text: "🧠 persona 4 responded — verifying TEE signature...", type: "delta" },
  { text: "🧠 persona 2 responded — verifying TEE signature...", type: "beta" },
  { text: "🔐 All provider signatures verified on 0G.", type: "success" },
  { text: "📁 Uploading round record to 0G Storage...", type: "system" },
  { text: "✅ 0G Storage root committed.", type: "success" },
  { text: "⚓ Anchoring root on 0G Chain (attestation tx)...", type: "system" },
  { text: "✅ Round attested on 0G Chain.", type: "success" },
  { text: "🎉 Shuffling and anonymizing seats...", type: "success" },
];

/* ─── AI node definitions ────────────────────────────────────────────────── */
const AI_NODES = [
  { id: "alpha",   label: "α", dispatchIndex: 2,  doneIndex: 13 },
  { id: "beta",    label: "β", dispatchIndex: 3,  doneIndex: 16 },
  { id: "gamma",   label: "γ", dispatchIndex: 4,  doneIndex: 12 },
  { id: "delta",   label: "δ", dispatchIndex: 5,  doneIndex: 15 },
  { id: "epsilon", label: "ε", dispatchIndex: 6,  doneIndex: 14 },
];

/* Evenly-spaced angle for each node on the orbit ring */
const NODE_ANGLES = [0, 72, 144, 216, 288];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function nodeState(logIndex: number, dispatchIndex: number, doneIndex: number) {
  const isDone    = logIndex > doneIndex;
  const isWorking = logIndex > dispatchIndex && !isDone;
  if (isDone)    return { ring: "border-brand-cyan",   bg: "bg-brand-cyan/15",   glow: "0 0 18px rgba(0,212,255,0.55)",    label: "text-brand-cyan",   pulse: false };
  if (isWorking) return { ring: "border-brand-violet", bg: "bg-brand-violet/15", glow: "0 0 18px rgba(139,127,255,0.55)", label: "text-brand-violet", pulse: true  };
  return           { ring: "border-white/10",           bg: "bg-white/5",         glow: "none",                             label: "text-text-muted",   pulse: false };
}

function logLineClass(log: string): string {
  if (log.startsWith("[√ PROOF]")) return "text-brand-green";
  if (log.startsWith("[NODE-"))   return "text-brand-cyan";
  return "text-text-secondary";
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function WaitingScreen({ prompt, packName, onCancel }: WaitingScreenProps) {
  const [logs, setLogs]         = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const terminalEndRef          = useRef<HTMLDivElement>(null);

  /* ── Log timing — IDENTICAL to original ─────────────────────────────── */
  useEffect(() => {
    if (logIndex < DECENTRALIZED_LOGS.length) {
      const delay = logIndex === 0 ? 400 : Math.random() * 1000 + 900;
      const timer = setTimeout(() => {
        const item = DECENTRALIZED_LOGS[logIndex];
        let prefix = "[0G-VAL] ";
        if (item.type === "alpha")        prefix = "[NODE-1] ";
        else if (item.type === "beta")    prefix = "[NODE-2] ";
        else if (item.type === "gamma")   prefix = "[NODE-3] ";
        else if (item.type === "delta")   prefix = "[NODE-4] ";
        else if (item.type === "epsilon") prefix = "[NODE-5] ";
        else if (item.type === "success") prefix = "[√ PROOF] ";

        setLogs((prev) => [...prev, `${prefix}${item.text}`]);
        setLogIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [logIndex]);

  /* ── Progress asymptote — IDENTICAL to original ─────────────────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 99 ? 99 : prev + (99 - prev) * 0.025));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  /* ── Scroll terminal (only the log box, never the whole page) ─────────── */
  useEffect(() => {
    const box = terminalEndRef.current?.parentElement;
    if (box) box.scrollTop = box.scrollHeight;
  }, [logs]);

  const humanLinked = logIndex > 7;

  return (
    <div
      id="waiting-screen"
      className="relative flex flex-col items-center min-h-screen w-full bg-dark-bg overflow-x-hidden"
    >
      {/* ── Neural dot-grid backdrop ─────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-40" />

      {/* ═══ NEON PROGRESS BAR ═══════════════════════════════════════════ */}
      <div className="w-full h-[2px] bg-white/5 flex-shrink-0">
        <div
          className="neon-progress h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ═══ INNER CONTENT ════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 pt-10 pb-12 gap-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-brand-violet/10 border border-brand-violet/25 text-brand-violet text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest font-mono">
            <Zap className="w-3 h-3" />
            Verifiable Round Assembly
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-white">
            Generating Verifiable Game Round
          </h2>
          <p className="text-text-secondary text-sm max-w-md">
            Five AI personas answering in parallel on{" "}
            <span className="text-brand-violet font-semibold">0G verifiable inference</span>. Each
            response is TEE-signed before it reaches you.
          </p>
        </motion.div>

        {/* ═══ ORBITAL NODE DIAGRAM ════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Orbit stage */}
          <div className="relative w-56 h-56 flex items-center justify-center">

            {/* Faint orbit track rings */}
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute rounded-full border border-brand-violet/10" style={{ inset: "14%" }} />

            {/* ── 5 AI nodes via rotation trick ──────────────────────────── */}
            {AI_NODES.map((node, i) => {
              const angle = NODE_ANGLES[i];
              const state = nodeState(logIndex, node.dispatchIndex, node.doneIndex);
              const isDone    = logIndex > node.doneIndex;
              const isWorking = logIndex > node.dispatchIndex && !isDone;

              return (
                <div
                  key={node.id}
                  className="absolute inset-0"
                  style={{
                    animation: "orbit-spin 12s linear infinite",
                    animationDelay: `${i * -2.4}s`,
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  {/* Counter-rotate so the badge label stays readable */}
                  <div
                    className="absolute top-0 left-1/2"
                    style={{ transform: `translateX(-50%) rotate(-${angle}deg)` }}
                  >
                    <motion.div
                      animate={
                        isWorking
                          ? { boxShadow: ["0 0 6px rgba(139,127,255,0.3)", "0 0 22px rgba(139,127,255,0.7)", "0 0 6px rgba(139,127,255,0.3)"] }
                          : isDone
                          ? { boxShadow: "0 0 14px rgba(0,212,255,0.55)" }
                          : { boxShadow: "none" }
                      }
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${state.bg} ${state.ring}`}
                    >
                      <span className={`text-[11px] font-mono font-bold leading-none ${state.label}`}>
                        {node.label}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}

            {/* ── Central glowing orb ──────────────────────────────────────── */}
            <div
              className="relative z-10 w-16 h-16 rounded-full bg-brand-violet/20 border-2 border-brand-violet flex items-center justify-center"
              style={{ boxShadow: "0 0 40px rgba(139,127,255,0.5), 0 0 80px rgba(139,127,255,0.15)" }}
            >
              <div
                className="absolute inset-0 rounded-full bg-brand-violet/10 animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <span className="relative font-mono font-bold text-sm text-white tracking-widest">0G</span>
            </div>
          </div>

          {/* ── Human node below orbit ──────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-px h-5 transition-colors duration-700 ${humanLinked ? "bg-brand-green/60" : "bg-white/10"}`}
            />
            <motion.div
              animate={
                humanLinked
                  ? { boxShadow: ["0 0 6px rgba(0,245,160,0.25)", "0 0 20px rgba(0,245,160,0.6)", "0 0 6px rgba(0,245,160,0.25)"] }
                  : { boxShadow: "none" }
              }
              transition={{ repeat: Infinity, duration: 1.6 }}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                humanLinked
                  ? "bg-brand-green/15 border-brand-green"
                  : "bg-white/5 border-white/15"
              }`}
            >
              <span className={`text-[10px] font-mono font-bold ${humanLinked ? "text-brand-green" : "text-text-muted"}`}>
                H
              </span>
            </motion.div>
            <span
              className={`text-[9px] font-mono uppercase tracking-widest transition-colors duration-500 ${
                humanLinked ? "text-brand-green" : "text-text-muted"
              }`}
            >
              HUMAN
            </span>
          </div>

          {/* Progress readout */}
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-text-muted">0G Synced</span>
            <span className="font-mono text-xs font-bold text-brand-violet">
              {Math.floor(progress)}%
            </span>
            <span className="font-mono text-[10px] text-text-muted animate-pulse">
              · sealing proofs…
            </span>
          </div>
        </motion.div>

        {/* ═══ PROMPT CARD ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
        >
          {/* Gradient left accent bar */}
          <div
            className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl"
            style={{ background: "linear-gradient(180deg, #8B7FFF 0%, #00D4FF 100%)" }}
          />
          <div className="flex justify-between items-center mb-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
            <span>Active Prompt</span>
            <span className="text-brand-violet border border-brand-violet/30 bg-brand-violet/10 px-2 py-0.5 rounded-full">
              {packName} Pack
            </span>
          </div>
          <p className="text-lg font-medium text-white italic font-display leading-snug">
            {prompt || "Choosing random prompt..."}
          </p>
        </motion.div>

        {/* ═══ TELEMETRY TERMINAL ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="w-full bg-black/60 rounded-xl border border-white/[0.08] overflow-hidden"
          style={{ backdropFilter: "blur(16px)" }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 font-mono text-[10px] text-text-muted uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5 text-brand-violet" />
              0G-GALILEO Telemetry Console
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="font-mono text-[10px] text-brand-green font-bold tracking-widest uppercase">
                Live
              </span>
            </div>
          </div>

          {/* Log feed */}
          <div className="h-44 overflow-y-auto px-4 py-3 font-mono text-[10px] space-y-1.5">
            <AnimatePresence initial={false}>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`leading-relaxed break-all flex gap-1.5 ${logLineClass(log)}`}
                >
                  <span className="text-brand-violet/50 select-none flex-shrink-0">▶</span>
                  <span>{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="text-text-muted italic">
                Waiting to establish network pipeline...
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </motion.div>

        {/* ═══ NODE STATUS LEGEND ═══════════════════════════════════════════ */}
        <div className="w-full flex items-center justify-center gap-6 text-[9px] font-mono uppercase tracking-widest text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/15 border border-white/20 inline-block" />
            Waiting
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-violet/40 border border-brand-violet inline-block" />
            Working
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-cyan/40 border border-brand-cyan inline-block" />
            Verified
          </span>
        </div>

        {/* ═══ CANCEL ═══════════════════════════════════════════════════════ */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-white font-mono text-xs underline underline-offset-4 cursor-pointer transition-colors duration-200"
          >
            Cancel and go back home
          </button>
        )}
      </div>
    </div>
  );
}

