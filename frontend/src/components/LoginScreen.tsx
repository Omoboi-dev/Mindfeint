/**
 * LoginScreen.tsx — Full-page Google sign-in gate for Mindfeint.
 *
 * Matches the existing dark/cyberpunk aesthetic: deep navy background,
 * violet/green neon glows, scanline overlay, JetBrains Mono labels.
 * Features a glassmorphism card, animated logo, Google CTA button,
 * and a short explainer of account abstraction for the player.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shield, Zap, AlertCircle, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSignIn();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      // Ignore user-cancelled popup (they clicked away)
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
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-brand-violet opacity-10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-brand-blue opacity-10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-brand-green opacity-5 blur-[80px] rounded-full pointer-events-none" />

      {/* ── Cyber scanline overlay ── */}
      <div className="absolute inset-0 cyber-scanlines opacity-15 pointer-events-none" />

      {/* ── Floating particle dots (decorative) ── */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brand-violet/40"
          style={{
            left: `${10 + (i * 7.5) % 85}%`,
            top: `${5 + (i * 13) % 90}%`,
          }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* ── Top brand strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 flex items-center gap-2.5"
      >
        <div className="w-8 h-8 bg-brand-violet rounded flex items-center justify-center shadow-[0_0_15px_rgba(124,108,255,0.5)]">
          <span className="text-black font-black text-xl font-display">M</span>
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
        className="absolute top-7 right-6 flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
        <span className="text-[10px] font-mono text-brand-green">0G-GALILEO_LIVE</span>
      </motion.div>

      {/* ── Main glassmorphism login card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card glow border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-violet/30 via-transparent to-brand-blue/20 pointer-events-none" />

        <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">

          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-violet/60 to-transparent" />

          {/* ── Logo block ── */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-5"
            >
              <Sparkles className="w-3 h-3" />
              Blockchain-grade Turing Test
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl font-extrabold tracking-tight text-white font-display mb-2"
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
              <span className="text-brand-violet font-medium">Can you tell which one?</span>
            </motion.p>
          </div>

          {/* ── Google sign-in button ── */}
          <motion.button
            id="btn-google-signin"
            onClick={handleSignIn}
            disabled={isLoading}
            whileHover={isLoading ? {} : { scale: 1.02, y: -1 }}
            whileTap={isLoading ? {} : { scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,255,255,0.12)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mb-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                <span className="text-gray-600">Connecting…</span>
              </>
            ) : (
              <>
                {/* Google "G" logo SVG */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* ── Error toast ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-4"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              what you get
            </span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* ── Feature pills ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2.5"
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
            className="text-center text-[10px] font-mono text-gray-600 mt-6 leading-relaxed"
          >
            By continuing you accept Mindfeint's terms.
            <br />
            No passwords stored · No gas required · Powered by 0G
          </motion.p>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent" />
        </div>
      </motion.div>

      {/* ── Decorative tech labels ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-[10px] font-mono text-gray-700"
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
    wrapper: "bg-brand-violet/8 border-brand-violet/20",
    icon: "text-brand-violet bg-brand-violet/10",
    title: "text-brand-violet",
  },
  green: {
    wrapper: "bg-brand-green/8 border-brand-green/20",
    icon: "text-brand-green bg-brand-green/10",
    title: "text-brand-green",
  },
  blue: {
    wrapper: "bg-brand-blue/8 border-brand-blue/20",
    icon: "text-brand-blue bg-brand-blue/10",
    title: "text-brand-blue",
  },
};

function FeaturePill({ icon, color, title, description }: FeaturePillProps) {
  const c = colorMap[color];
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-3 ${c.wrapper}`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-semibold ${c.title}`}>{title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
