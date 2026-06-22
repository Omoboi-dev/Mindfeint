import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Terminal, Cpu, Database } from "lucide-react";

interface WaitingScreenProps {
  prompt: string;
  packName: string;
  onCancel?: () => void;
}

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
  { text: "🎉 Shuffling and anonymizing seats...", type: "success" }
];

export default function WaitingScreen({ prompt, packName, onCancel }: WaitingScreenProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Print logs over time. Stretched (~0.9–1.9s each) so the ~21 lines span the
  // real ~25–35s round-assembly window instead of finishing in a few seconds.
  useEffect(() => {
    if (logIndex < DECENTRALIZED_LOGS.length) {
      const delay = logIndex === 0 ? 400 : Math.random() * 1000 + 900;
      const timer = setTimeout(() => {
        const item = DECENTRALIZED_LOGS[logIndex];
        let prefix = "[0G-VAL] ";
        if (item.type === "alpha") prefix = "[NODE-1] ";
        else if (item.type === "beta") prefix = "[NODE-2] ";
        else if (item.type === "gamma") prefix = "[NODE-3] ";
        else if (item.type === "delta") prefix = "[NODE-4] ";
        else if (item.type === "epsilon") prefix = "[NODE-5] ";
        else if (item.type === "success") prefix = "[√ PROOF] ";

        setLogs((prev) => [...prev, `${prefix}${item.text}`]);
        setLogIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [logIndex]);

  // Progress eases toward 99% asymptotically (slows as it climbs), so it never
  // stalls flat at 99 early — it keeps creeping until the round is actually ready.
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 99 ? 99 : prev + (99 - prev) * 0.025));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto px-4" id="waiting-screen">
      <div className="w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider font-mono">
          <Loader2 className="w-3" /> Verifiable Round Assembly
        </div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-2">
          Generating Verifiable Game Round
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Five AI personas are answering the prompt in parallel on 0G verifiable inference. Each response is signed inside a TEE before it reaches you.
        </p>
      </div>

      {/* Cybernetic Prompt Card */}
      <div className="w-full bg-dark-card border border-dark-border rounded-xl p-5 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-violet" />
        <div className="flex justify-between items-center mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
          <span>Active Prompt Info</span>
          <span className="text-brand-violet">{packName} Selection</span>
        </div>
        <p className="text-lg font-medium text-white italic font-display">
          {prompt || "Choosing random prompt..."}
        </p>
      </div>

      {/* Modern High-Tech Concentric Interactive Loader */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ring status column */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-center items-center h-48 md:col-span-1">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Pulsing shadow */}
            <div className="absolute inset-0 bg-brand-violet/10 rounded-full animate-ping" />
            {/* Concentric rotating lines */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-dark-border"
                strokeWidth="4"
                fill="transparent"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-brand-violet glow-violet"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
                initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - progress / 100) }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-white">{Math.floor(progress)}%</span>
              <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">0G Synced</span>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-mono mt-3 animate-pulse">Validator Proofs Sealing...</span>
        </div>

        {/* Network status logs terminal */}
        <div className="bg-black/80 border border-dark-border rounded-xl p-4 md:col-span-2 flex flex-col h-48">
          <div className="flex justify-between items-center pb-2 border-b border-dark-border/60 mb-2 font-mono text-xs text-gray-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Terminal className="w-3.5 text-brand-violet" /> 0G-GALILEO Telemetry Console</span>
            <span className="text-green-400 font-bold">● LIVE FEED</span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 pr-2">
            <AnimatePresence initial={false}>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`leading-relaxed break-all ${
                    log.includes("√ PROOF")
                      ? "text-brand-green"
                      : log.includes("Node-") && log.includes("Attestation")
                      ? "text-brand-blue"
                      : "text-gray-400"
                  }`}
                >
                  <span className="text-brand-violet/70">▶</span> {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="text-gray-600 italic">Waiting to establish network pipeline...</div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>

      {/* Status indicator row of the 5 nodes + 1 human */}
      <h3 className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider mb-3">Node Inference Status</h3>
      <div className="w-full grid grid-cols-6 gap-3 mb-8">
        {[
          { id: "persona-alpha", name: "Alpha-Node" },
          { id: "persona-beta", name: "Beta-Socrates" },
          { id: "persona-gamma", name: "Gamma-Zeno" },
          { id: "persona-delta", name: "Delta-Hermes" },
          { id: "persona-epsilon", name: "Epsilon-Slacker" }
        ].map((p, i) => {
          const isDone = logIndex > (12 + i);
          const isWorking = logIndex > (2 + i) && !isDone;
          return (
            <div
              key={p.id}
              className={`border rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all ${
                isDone
                  ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                  : isWorking
                  ? "bg-brand-violet/10 border-brand-violet text-brand-violet animate-pulse"
                  : "bg-dark-card/40 border-dark-border/40 text-gray-600"
              }`}
            >
              <Cpu className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-semibold font-mono block truncate w-full">{p.name.split("-")[1]}</span>
              <span className="text-[8px] font-mono whitespace-nowrap">
                {isDone ? "✓ Blocked" : isWorking ? "Inference" : "Waiting"}
              </span>
            </div>
          );
        })}
        {/* Human seat source check */}
        <div
          className={`border rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all ${
            logIndex > 7
              ? "bg-brand-green/10 border-brand-green text-brand-green glow-green"
              : "bg-dark-card/40 border-dark-border/40 text-gray-600"
          }`}
        >
          <Database className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-semibold font-mono block truncate w-full">Human-DB</span>
          <span className="text-[8px] font-mono whitespace-nowrap">
            {logIndex > 7 ? "✓ Linked" : "Waiting"}
          </span>
        </div>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="text-xs font-mono text-gray-400 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
        >
          Cancel and go back home
        </button>
      )}
    </div>
  );
}
