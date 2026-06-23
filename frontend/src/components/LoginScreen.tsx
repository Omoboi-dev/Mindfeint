import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shield, Zap, AlertCircle, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
}

// 3D perspective hook
function useTiltCard(maxDeg = 8) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -maxDeg;
    const rotateY = ((x - centerX) / centerX) * maxDeg;

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    ref.current.style.transition = 'none';
  };

  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    ref.current.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  };

  return { ref, onMouseMove, onMouseLeave };
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tilt = useTiltCard(10); // 10 degrees max tilt

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSignIn();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request")) {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-dark-bg text-gray-100 flex flex-col items-center justify-center relative overflow-hidden font-sans"
      id="mindfeint-login"
    >
      {/* ── Ambient background glow blobs ── */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-brand-violet opacity-15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-brand-blue opacity-10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-brand-green opacity-5 blur-[80px] rounded-full pointer-events-none" />

      {/* ── Cyber scanline overlay ── */}
      <div className="absolute inset-0 cyber-scanlines opacity-15 pointer-events-none" />

      {/* ── Floating particle dots (decorative) ── */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brand-violet/40 pointer-events-none"
          style={{
            left: `${10 + (i * 7.5) % 85}%`,
            top: `${5 + (i * 13) % 90}%`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1], y: [0, -15, 0] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* ── Top brand strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 flex items-center gap-2.5 z-20"
      >
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-md bg-brand-violet/40 blur-md" />
          <div className="relative w-8 h-8 bg-brand-violet rounded-md flex items-center justify-center shadow-[0_0_20px_rgba(139,127,255,0.6)]">
            <span className="text-black font-black text-xl font-display">M</span>
          </div>
        </div>
        <span className="text-sm font-bold tracking-tighter text-white font-display select-none">
          MINDFEINT
        </span>
      </motion.div>

      {/* ── 0G live badge ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute top-7 right-6 flex items-center gap-1.5 z-20"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_rgba(0,245,160,0.8)]" />
        <span className="text-[10px] font-mono text-brand-green tracking-widest uppercase">0G-GALILEO_LIVE</span>
      </motion.div>

      {/* ── Main glassmorphism login card with 3D tilt ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4 perspective-card"
      >
        <div 
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className="relative glass-card rounded-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-violet/80 to-transparent" />
          
          {/* Subtle neural grid overlay inside the card */}
          <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none rounded-2xl" />

          {/* ── Logo block ── */}
          <div className="text-center mb-8 relative" style={{ transform: 'translateZ(30px)' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-5 shadow-[0_0_15px_rgba(139,127,255,0.2)]"
            >
              <Sparkles className="w-3 h-3" />
              Blockchain-grade Turing Test
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl font-extrabold tracking-tight text-white font-display mb-2 drop-shadow-lg"
            >
              Enter the Arena
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-gray-400 text-sm leading-relaxed"
            >
              One of six answers is a real person.
              <br />
              <span className="text-brand-violet font-medium drop-shadow-md">Can you tell which one?</span>
            </motion.p>
          </div>

          {/* ── Google sign-in button ── */}
          <div className="relative mb-5" style={{ transform: 'translateZ(40px)' }}>
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-xl opacity-50 transition-opacity" />
            <motion.button
              id="btn-google-signin"
              onClick={handleSignIn}
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.03, y: -2 }}
              whileTap={isLoading ? {} : { scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 25 }}
              className="relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-bold text-sm py-3.5 px-6 rounded-xl transition-colors shadow-[0_4px_25px_rgba(255,255,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  <span className="text-gray-600">Connecting via 0G…</span>
                </>
              ) : (
                <>
                  {/* Google "G" logo SVG */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Create Account / Sign In
                </>
              )}
            </motion.button>
          </div>

          {/* ── Error toast ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ transform: 'translateZ(30px)' }}
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-5" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Account Abstraction
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ── Feature pills ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2.5 relative"
            style={{ transform: 'translateZ(25px)' }}
          >
            <FeaturePill
              icon={<Shield className="w-3.5 h-3.5" />}
              color="violet"
              title="Persistent identity"
              description="Your stats and history follow you across devices"
            />
            <FeaturePill
              icon={<Zap className="w-3.5 h-3.5" />}
              color="green"
              title="Gasless smart wallet"
              description="A Kernel ERC-4337 account — no seed phrase, no gas fees"
            />
            <FeaturePill
              icon={<Sparkles className="w-3.5 h-3.5" />}
              color="blue"
              title="On-chain proof trail"
              description="Every round you play is anchored on 0G Chain and verifiable"
            />
          </motion.div>

          {/* ── Fine-print ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-center text-[10px] font-mono text-gray-600 mt-6 leading-relaxed relative"
            style={{ transform: 'translateZ(15px)' }}
          >
            By continuing you accept Mindfeint's terms.
            <br />
            No passwords stored · No gas required · Powered by 0G
          </motion.p>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
        </div>
      </motion.div>

      {/* ── Decorative tech labels ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-[10px] font-mono text-gray-600 z-0 select-none"
      >
        <span>0G VERIFIABLE INFERENCE</span>
        <span className="text-gray-800">·</span>
        <span>ERC-4337 ACCOUNT ABSTRACTION</span>
        <span className="text-gray-800">·</span>
        <span>GALILEO TESTNET</span>
      </motion.div>
    </div>
  );
}

/* ── Sub-component: feature highlight pill ── */
interface FeaturePillProps {
  icon: React.ReactNode;
  color: "violet" | "green" | "blue";
  title: string;
  description: string;
}

const colorMap = {
  violet: {
    wrapper: "bg-brand-violet/5 border-brand-violet/20 hover:border-brand-violet/40 hover:bg-brand-violet/10",
    icon: "text-brand-violet bg-brand-violet/15",
    title: "text-brand-violet drop-shadow-md",
  },
  green: {
    wrapper: "bg-brand-green/5 border-brand-green/20 hover:border-brand-green/40 hover:bg-brand-green/10",
    icon: "text-brand-green bg-brand-green/15",
    title: "text-brand-green drop-shadow-md",
  },
  blue: {
    wrapper: "bg-brand-blue/5 border-brand-blue/20 hover:border-brand-blue/40 hover:bg-brand-blue/10",
    icon: "text-brand-blue bg-brand-blue/15",
    title: "text-brand-blue drop-shadow-md",
  },
};

function FeaturePill({ icon, color, title, description }: FeaturePillProps) {
  const c = colorMap[color];
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-3 transition-colors cursor-default ${c.wrapper}`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-semibold ${c.title}`}>{title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
