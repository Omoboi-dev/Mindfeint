import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shield, Zap, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
}

// 3D perspective hook for the right-side card
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
  const tilt = useTiltCard(8);

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
      {/* Injecting an ultra-bold geometric font for the redesign */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#010103] text-white flex flex-col lg:flex-row overflow-hidden relative font-outfit">
        
        {/* ── Left Side: Massive BOLD Typography & Branding ── */}
        <div className="relative lg:w-[55%] flex flex-col justify-center px-8 lg:px-20 py-16 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/10 z-10">
          
          {/* Ambient left-side blobs */}
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-brand-violet opacity-20 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-cyan opacity-10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 cyber-scanlines opacity-20 pointer-events-none mix-blend-overlay" />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(139,127,255,0.2)]">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Powered by 0G
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-[100px] font-black leading-[0.9] tracking-tighter mb-8 drop-shadow-2xl text-white">
              SPOT<br />
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-brand-cyan">HUMAN.</span>
            </h1>

            <p className="text-xl lg:text-2xl font-semibold text-gray-400 max-w-md leading-snug">
              Six players. Five AIs.<br/>One genuine human intellect.
            </p>

            {/* Decorative data blocks */}
            <div className="mt-12 flex gap-6 border-t border-white/10 pt-8">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Architecture</div>
                <div className="text-sm font-black text-white tracking-wide">ERC-4337 Smart Wallets</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Compute</div>
                <div className="text-sm font-black text-white tracking-wide">TEE-Verified Inference</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right Side: Bold Login Interaction ── */}
        <div className="relative lg:w-[45%] flex items-center justify-center p-6 sm:p-12 z-20 bg-black/40">
          
          {/* Subtle grid background on the right */}
          <div className="absolute inset-0 neural-grid opacity-30 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md perspective-card"
          >
            <div 
              ref={tilt.ref}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
              className="relative glass-card rounded-3xl p-8 sm:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 bg-black/60 backdrop-blur-3xl overflow-hidden"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              {/* Ultra thick top accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-green" />

              <div className="text-center mb-10 relative" style={{ transform: 'translateZ(40px)' }}>
                <div className="w-16 h-16 mx-auto bg-white text-black rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  <span className="font-black text-4xl">M</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                  CREATE ACCOUNT
                </h2>
                <p className="text-gray-400 font-semibold text-sm">
                  Join the Galileo Testnet Arena.
                </p>
              </div>

              {/* ── BOLD Google sign-in button ── */}
              <div className="relative mb-6" style={{ transform: 'translateZ(50px)' }}>
                <div className="absolute inset-0 bg-brand-violet/20 blur-xl rounded-2xl opacity-0 transition-opacity" />
                <motion.button
                  id="btn-google-signin"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  whileHover={isLoading ? {} : { scale: 1.04, y: -4 }}
                  whileTap={isLoading ? {} : { scale: 0.96 }}
                  className="relative w-full flex items-center justify-center gap-4 bg-white text-black font-black text-lg py-5 px-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.25)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                      <span className="text-gray-600">PROVISIONING WALLET...</span>
                    </>
                  ) : (
                    <>
                      {/* Bolder Google logo */}
                      <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                    style={{ transform: 'translateZ(30px)' }}
                    className="flex items-start gap-3 bg-red-500/10 border-2 border-red-500/40 text-red-400 font-bold text-sm rounded-xl p-4 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4 relative" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Shield className="w-5 h-5 text-brand-violet" />
                  <div className="text-sm font-bold text-gray-200">Zero-knowledge proof secured</div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Sparkles className="w-5 h-5 text-brand-cyan" />
                  <div className="text-sm font-bold text-gray-200">Gasless transactions on 0G</div>
                </div>
              </div>

              {/* ── Fine-print ── */}
              <p className="text-center text-[11px] font-bold text-gray-500 mt-8 tracking-wide uppercase relative" style={{ transform: 'translateZ(10px)' }}>
                By continuing, you accept Mindfeint's terms.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
