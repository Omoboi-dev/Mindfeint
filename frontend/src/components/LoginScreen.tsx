import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Loader2, Sparkles, Fingerprint } from "lucide-react";

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
      const msg = err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request")) {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Inject ultra-bold Outfit font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .grid-floor {
          background-size: 50px 50px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          transform: perspective(500px) rotateX(60deg) translateY(100px) translateZ(-200px);
        }
      `}</style>

      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-outfit">
        
        {/* ── Immersive Cinematic Background ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-brand-violet/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[60%] grid-floor pointer-events-none origin-bottom opacity-50" />
        
        {/* ── Giant Background Typography ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none mix-blend-screen opacity-5">
          <h1 className="text-[20vw] font-black leading-none tracking-tighter text-white whitespace-nowrap">
            MINDFEINT
          </h1>
        </div>

        {/* ── Floating Glows ── */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-violet/20 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-cyan/10 blur-[150px] rounded-full pointer-events-none" />

        {/* ── Central Monolithic Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[480px] mx-4"
        >
          {/* Outer Monolith Box */}
          <div className="relative bg-black/80 backdrop-blur-3xl border-2 border-white/10 rounded-3xl p-8 sm:p-12 shadow-[0_0_80px_rgba(139,127,255,0.15)] overflow-hidden">
            
            {/* Top Glowing Edge */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-green" />

            {/* ── Header ── */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.2)] border-4 border-white/20"
              >
                <Fingerprint className="w-10 h-10 text-black" strokeWidth={2.5} />
              </motion.div>

              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3 uppercase">
                Zero Gravity
              </h2>
              <p className="text-gray-400 font-bold text-base tracking-wide">
                AUTHENTICATE YOUR IDENTITY
              </p>
            </div>

            {/* ── Action Area ── */}
            <div className="relative mb-8">
              <motion.button
                id="btn-google-signin"
                onClick={handleSignIn}
                disabled={isLoading}
                whileHover={isLoading ? {} : { scale: 1.02 }}
                whileTap={isLoading ? {} : { scale: 0.98 }}
                className="group relative w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-100 text-black font-black text-xl py-6 px-6 rounded-2xl transition-all shadow-[0_10px_40px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:animate-shimmer pointer-events-none" />
                
                {isLoading ? (
                  <>
                    <Loader2 className="w-7 h-7 animate-spin text-gray-500" />
                    <span>INITIALIZING 0G...</span>
                  </>
                ) : (
                  <>
                    {/* Minimalist bold Google logo */}
                    <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    CONTINUE WITH GOOGLE
                  </>
                )}
              </motion.button>
            </div>

            {/* ── Error toast ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-center gap-3 bg-red-500/10 border-2 border-red-500/50 text-red-400 font-bold text-sm rounded-xl p-4 mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Trust Badges ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-violet" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Gasless<br/>Wallet</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-green/20 border border-brand-green flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                </div>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">On-chain<br/>Verified</span>
              </div>
            </div>

          </div>
        </motion.div>
        
        {/* ── Footer ── */}
        <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
          <p className="text-[12px] font-bold text-gray-600 tracking-[0.2em] uppercase">
            Powered by 0G Network
          </p>
        </div>
      </div>
    </>
  );
}
