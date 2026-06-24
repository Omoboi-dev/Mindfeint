import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Bot,
  Eye,
  UserCheck,
  Sparkles,
  Check,
  ArrowRight,
  RefreshCw,
  Send,
  Shield,
  LogOut,
  ChevronRight,
  Database,
  Menu,
  X,
  Wallet,
  Loader2,
  Map
} from "lucide-react";

import { AppState, PromptPack, PublicRound, Reveal, PlayerStats, GameHistoryEntry } from "./types";
import WaitingScreen from "./components/WaitingScreen";
import ProofModal from "./components/ProofModal";
import VerdictCard from "./components/VerdictCard";
import HistoryStats from "./components/HistoryStats";
import HowToPlay from "./components/HowToPlay";
import About from "./components/About";
import HistoryPage from "./components/HistoryPage";
import LoginScreen from "./components/LoginScreen";
import Roadmap from "./components/Roadmap";
import { useAuth } from "./auth/useAuth";

export default function App() {
  // ── Auth (Firebase + ZeroDev) ──
  const { user, loading: authLoading, walletAddress, walletLoading, signInWithGoogle, signOut } = useAuth();

  // Stable voter ID: use Firebase UID when authenticated, fall back to
  // a session-scoped random id so unauthenticated play still works.
  const sessionId = useRef("guest_" + Math.random().toString(36).substring(2, 11));
  const voterId = user?.uid ?? sessionId.current;

  // Game States
  const [appState, setAppState] = useState<AppState>("LOBBY");
  const [packs, setPacks] = useState<PromptPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<string>("spicy");
  
  // Active Round States & Details
  const [roundPrompt, setRoundPrompt] = useState<string>("");
  const [activeRound, setActiveRound] = useState<PublicRound | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  
  // Reveal Summary Details
  const [votingResult, setVotingResult] = useState<Reveal | null>(null);
  const [revealingSuspense, setRevealingSuspense] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [isCastingVote, setIsCastingVote] = useState(false);

  // Bumped whenever the player navigates away; lets an in-flight round fetch know
  // it was cancelled so it doesn't yank the player back into the table.
  const reqSeq = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [confetti, setConfetti] = useState<{id:number;x:number;color:string}[]>([]);
  const confettiId = useRef(0);

  // Scroll detection for header elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Confetti burst helper
  const triggerConfetti = useCallback(() => {
    const colors = ['#8B7FFF','#00D4FF','#00F5A0','#F59E0B','#FF4D6D'];
    const burst = Array.from({ length: 28 }, (_, i) => ({
      id: confettiId.current++,
      x: 20 + Math.random() * 60,
      color: colors[i % colors.length],
    }));
    setConfetti(burst);
    setTimeout(() => setConfetti([]), 1200);
  }, []);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close the account menu when clicking anywhere outside it.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userMenuOpen]);

  // Hider Mode States
  const [hiderPrompt, setHiderPrompt] = useState<string>("");
  const [hiderText, setHiderText] = useState("");
  const [isSubmittingHider, setIsSubmittingHider] = useState(false);

  // Stats & Match Logs Persistence
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem("mindfeint_stats");
    return saved
      ? JSON.parse(saved)
      : {
          roundsPlayed: 0,
          humansSpotted: 0,
          fooledCount: 0,
          currentStreak: 0,
          highestStreak: 0,
        };
  });

  const [history, setHistory] = useState<GameHistoryEntry[]>(() => {
    const saved = localStorage.getItem("mindfeint_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Save Stats to Local Storage
  useEffect(() => {
    localStorage.setItem("mindfeint_stats", JSON.stringify(stats));
  }, [stats]);

  // Save History to Local Storage
  useEffect(() => {
    localStorage.setItem("mindfeint_history", JSON.stringify(history));
  }, [history]);

  // Load Prompt Packs on Boot
  useEffect(() => {
    fetch("/api/packs")
      .then((res) => res.json())
      .then((data) => setPacks(data))
      .catch((err) => console.error("Error loading prompt packs:", err));
  }, []);

  // Navigate to any view, invalidating any in-flight round request so a slow
  // round can't snap the player back into the table after they've left.
  const navTo = (s: AppState) => {
    reqSeq.current++;
    setAppState(s);
    setMenuOpen(false);
  };
  const goHome = () => navTo("LOBBY");

  const navCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
      active ? "text-brand-violet bg-brand-violet/10" : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  // 1. Core Action: Initiate Detector Round
  const handleStartDetector = async (packId: string) => {
    const myReq = ++reqSeq.current;
    setSelectedPack(packId);
    setAppState("WAITING");
    setSelectedSeat(null);
    setVotingResult(null);
    setActiveRound(null);

    // The round itself is the wait (~25-35s while 5 personas answer on 0G).
    // The waiting screen plays during this; we transition the moment it's ready.
    try {
      const roundRes = await fetch("/api/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId, voterId }),
      });
      const roundData = (await roundRes.json()) as PublicRound;
      // Player left / started something else while we were waiting — drop this result.
      if (reqSeq.current !== myReq) return;
      setRoundPrompt(roundData.prompt);
      setActiveRound(roundData);
      setAppState("DETECTOR");
    } catch (e) {
      console.error("Round assembly failed:", e);
      if (reqSeq.current === myReq) setAppState("LOBBY");
    }
  };

  // 2. Core Action: Lock in Vote Accusation
  const handleLockInVote = async () => {
    if (selectedSeat === null || !activeRound || isCastingVote) return;
    setIsCastingVote(true);
    setRevealingSuspense(true);

    try {
      const res = await fetch(`/api/round/${activeRound.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seat: selectedSeat, voterId }),
      });
      const revealData = (await res.json()) as Reveal;

      // Trigger suspension countdown
      setTimeout(() => {
        setVotingResult(revealData);
        setAppState("REVEAL");
        setRevealingSuspense(false);
        setIsCastingVote(false);

        // Update streaks and high-scores
        setStats((prev) => {
          const played = prev.roundsPlayed + 1;
          const correct = revealData.correct;
          const spotted = prev.humansSpotted + (correct ? 1 : 0);
          const fooled = prev.fooledCount + (correct ? 0 : 1);
          const streak = correct ? prev.currentStreak + 1 : 0;
          const highest = Math.max(prev.highestStreak, streak);

          return {
            roundsPlayed: played,
            humansSpotted: spotted,
            fooledCount: fooled,
            currentStreak: streak,
            highestStreak: highest,
          };
        });

        // Add history entry
        const isCorrect = revealData.correct;
        const recordEntry: GameHistoryEntry = {
          roundId: activeRound.id,
          prompt: activeRound.prompt,
          guessedSeat: selectedSeat,
          humanSeat: revealData.humanSeat,
          correct: isCorrect,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          storageTx: revealData.storageTx ?? null,
          chainTx: revealData.chainTx ?? null,
        };
        setHistory((prev) => [recordEntry, ...prev].slice(0, 50)); // cap at 50

      }, 2500); // Dramatic reveal timing!
    } catch (e) {
      console.error("Vote failure:", e);
      setRevealingSuspense(false);
      setIsCastingVote(false);
    }
  };

  // 3. Core Action: Setup Hider Mode Prompt
  const handleStartHider = async () => {
    setHiderText("");
    try {
      const res = await fetch(`/api/prompt?pack=${selectedPack}`);
      const data = await res.json();
      setHiderPrompt(data.prompt);
      setAppState("HIDER");
    } catch (e) {
      console.error("Failed to load prompt for Hider mode", e);
    }
  };

  // Fetch another prompt for Hider
  const handleRefreshHiderPrompt = async () => {
    try {
      const res = await fetch(`/api/prompt?pack=${selectedPack}`);
      const data = await res.json();
      setHiderPrompt(data.prompt);
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Core Action: Submit Custom Hider Response
  const handleSubmitHider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hiderText.trim() || isSubmittingHider) return;

    setIsSubmittingHider(true);
    try {
      const response = await fetch("/api/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: hiderPrompt, text: hiderText, voterId }),
      });
      const data = await response.json();
      if (data.ok) {
        setAppState("HIDER_SUCCESS");
      }
    } catch (e) {
      console.error("Hider submission error:", e);
    } finally {
      setIsSubmittingHider(false);
    }
  };

  const handleResetStats = () => {
    if (confirm("Reset diagnostic statistics and streaks?")) {
      setStats({
        roundsPlayed: 0,
        humansSpotted: 0,
        fooledCount: 0,
        currentStreak: 0,
        highestStreak: 0,
      });
      setHistory([]);
    }
  };

  // ── Auth gate: full-page spinner while Firebase resolves ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-brand-violet rounded flex items-center justify-center shadow-[0_0_20px_rgba(124,108,255,0.5)]">
            <span className="text-black font-black text-2xl font-display">M</span>
          </div>
          <Loader2 className="w-6 h-6 text-brand-violet animate-spin" />
        </div>
      </div>
    );
  }

  // ── Auth gate: show login screen when not signed in ──
  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col relative overflow-hidden font-sans pt-4 sm:pt-5" id="mindfeint-root">
      {/* Immersive Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-violet opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Absolute background cyber grid lines */}
      <div className="absolute inset-0 cyber-scanlines opacity-15 pointer-events-none" />

      {/* ── Elite Header HUD ── */}
      <header className={`h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 relative z-10 transition-all duration-300 ${
        scrolled
          ? 'border-b border-brand-violet/10 bg-black/70 backdrop-blur-2xl shadow-[0_1px_0_rgba(139,127,255,0.08)]'
          : 'border-b border-white/5 bg-black/40 backdrop-blur-md'
      } mx-3 sm:mx-4 rounded-xl`}>

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={goHome}>
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-md bg-brand-violet/30 blur-md group-hover:bg-brand-violet/50 transition-colors" />
            <div className="relative w-8 h-8 bg-brand-violet rounded-md flex items-center justify-center shadow-[0_0_20px_rgba(139,127,255,0.5)]">
              <span className="text-black font-black text-xl font-display">M</span>
            </div>
          </div>
          <span className="text-sm sm:text-lg font-bold tracking-tighter text-white font-display hidden sm:block">
            MINDFEINT
          </span>
        </div>

        {/* Center nav with sliding indicator */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {([
            { label: 'Home',        state: 'LOBBY'   },
            { label: 'How to Play', state: 'HOWTO'   },
            { label: 'Roadmap',     state: 'ROADMAP' },
            { label: 'History',     state: 'HISTORY' },
            { label: 'About',       state: 'ABOUT'   },
          ] as { label: string; state: AppState }[]).map((item) => (
            <button
              key={item.state}
              onClick={() => navTo(item.state)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                appState === item.state
                  ? 'text-white'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {appState === item.state && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-brand-violet/15 border border-brand-violet/30 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 0G Live */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_6px_rgba(0,245,160,0.8)]" />
            <span className="text-[10px] font-mono text-brand-green tracking-wider">0G_LIVE</span>
          </div>
          <div className="h-5 w-px bg-white/8 hidden md:block" />

          {/* Wallet badge */}
          {walletAddress ? (
            <div className="hidden md:flex items-center gap-1.5 bg-brand-violet/10 border border-brand-violet/20 px-2.5 py-1 rounded-full">
              <Wallet className="w-3 h-3 text-brand-violet" />
              <span className="text-[10px] font-mono text-brand-violet">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </div>
          ) : walletLoading ? (
            <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              <Loader2 className="w-3 h-3 text-text-muted animate-spin" />
              <span className="text-[10px] font-mono text-text-muted">wallet…</span>
            </div>
          ) : null}

          {/* User avatar + dropdown (click to open) */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              aria-label="Account menu"
              className="block rounded-full focus:outline-none"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'Player'}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all shadow-[0_0_10px_rgba(139,127,255,0.2)] ${
                    userMenuOpen ? "border-brand-violet" : "border-brand-violet/30 hover:border-brand-violet"
                  }`}
                />
              ) : (
                <div className={`w-8 h-8 rounded-full bg-brand-violet/20 border-2 flex items-center justify-center cursor-pointer text-brand-violet text-xs font-bold transition-all ${
                  userMenuOpen ? "border-brand-violet" : "border-brand-violet/30 hover:border-brand-violet"
                }`}>
                  {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 flex flex-col bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)] min-w-[200px] z-50 gap-1"
                >
                  <p className="text-xs font-semibold text-white truncate px-2 pb-2 border-b border-white/8 mb-1">
                    {user.displayName ?? user.email ?? 'Player'}
                  </p>
                  {walletAddress && (
                    <p className="text-[9px] font-mono text-brand-violet px-2 pb-1 truncate">
                      {walletAddress.slice(0,8)}…{walletAddress.slice(-6)}
                    </p>
                  )}
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut(); }}
                    id="btn-sign-out"
                    className="flex items-center gap-2 text-xs text-text-secondary hover:text-brand-red px-2 py-2 rounded-xl hover:bg-red-500/8 transition-all cursor-pointer font-mono"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {appState !== 'LOBBY' && (
            <button
              onClick={goHome}
              className="hidden sm:flex bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase transition-all cursor-pointer items-center gap-1"
            >
              <LogOut className="w-3" /> Exit
            </button>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden text-text-muted hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.15}}><X className="w-5 h-5" /></motion.div>
                : <motion.div key="m" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.15}}><Menu className="w-5 h-5" /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Mobile Dropdown Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden relative z-20 mx-3 sm:mx-4 mt-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col gap-1 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          >
            {/* User strip */}
            <div className="flex items-center gap-3 px-3 py-3 border-b border-white/8 mb-1">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border border-brand-violet/30 shadow-[0_0_10px_rgba(139,127,255,0.2)]" />
                : <div className="w-9 h-9 rounded-full bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet text-sm font-bold">{(user.displayName ?? '?')[0].toUpperCase()}</div>
              }
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.displayName ?? user.email}</p>
                {walletAddress && <p className="text-[9px] font-mono text-brand-violet truncate mt-0.5">{walletAddress.slice(0,8)}…{walletAddress.slice(-6)}</p>}
              </div>
            </div>

            {([
              { label: 'Home',        state: 'LOBBY'   },
              { label: 'How to Play', state: 'HOWTO'   },
              { label: 'Roadmap',     state: 'ROADMAP' },
              { label: 'History',     state: 'HISTORY' },
              { label: 'About',       state: 'ABOUT'   },
            ] as { label: string; state: AppState }[]).map((item) => (
              <button
                key={item.state}
                onClick={() => navTo(item.state)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  appState === item.state ? 'text-brand-violet bg-brand-violet/10 border border-brand-violet/20' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-brand-red hover:bg-red-500/8 transition-all cursor-pointer mt-1 border-t border-white/8"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layout — center short screens (lobby), top-align tall ones
          (table/reveal/waiting) so their tops don't get clipped under the navbar. */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col relative z-10 ${
          appState === "LOBBY" || appState === "HIDER_SUCCESS" ? "justify-center" : "justify-start"
        }`}
      >
        <AnimatePresence mode="wait">
          
          {/* ── LOBBY / HERO ── */}
          {appState === "LOBBY" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 max-w-5xl mx-auto w-full"
            >
              {/* Hero Section */}
              <div className="text-center py-8 relative">
                {/* Ambient glow behind headline */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-brand-violet/10 blur-[80px] rounded-full pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] mb-6"
                >
                  <Sparkles className="w-3 h-3" /> Blockchain-Grade Turing Test
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.6, ease: [0.22,1,0.36,1] }}
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-display leading-none mb-4 relative"
                >
                  <span className="text-white">One of them</span>
                  <br />
                  <span className="text-gradient-violet">is real.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-text-secondary max-w-lg mx-auto text-base leading-relaxed mt-3"
                >
                  Six answers. Five AIs. One human. Every AI response is cryptographically signed inside a TEE on 0G — provably real, provably untampered.
                </motion.p>
              </div>

              {/* Live Stats Ticker */}
              <div className="w-full overflow-hidden border-y border-white/5 py-2.5 bg-black/20">
                <div className="ticker-track">
                  {[...Array(2)].map((_, ri) => (
                    <div key={ri} className="flex gap-12 items-center">
                      {[
                        { label: 'ROUNDS PLAYED', value: stats.roundsPlayed.toLocaleString() },
                        { label: 'HUMANS SPOTTED', value: stats.humansSpotted.toLocaleString() },
                        { label: 'AI VERIFIED', value: (stats.roundsPlayed * 5).toLocaleString() },
                        { label: 'ON-CHAIN TXS', value: (stats.roundsPlayed * 2).toLocaleString() },
                        { label: 'CURRENT STREAK', value: `${stats.currentStreak}` },
                        { label: 'BEST STREAK', value: `${stats.highestStreak}` },
                        { label: '0G NETWORK', value: 'GALILEO LIVE' },
                      ].map((item) => (
                        <span key={item.label} className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] font-mono text-text-muted tracking-[0.15em] uppercase">{item.label}</span>
                          <span className="text-[10px] font-mono font-bold text-brand-cyan">{item.value}</span>
                          <span className="w-px h-3 bg-white/10" />
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Cards — 3D tilt on hover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Detector card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.55, ease: [0.22,1,0.36,1] }}
                  whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  className="glass-card p-7 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-brand-violet/40 transition-all shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
                  onClick={() => handleStartDetector(selectedPack)}
                >
                  <div className="absolute inset-0 neural-grid opacity-30 rounded-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-violet/8 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-violet/15 transition-colors" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-brand-violet/12 border border-brand-violet/25 flex items-center justify-center text-brand-violet mb-5 group-hover:shadow-[0_0_25px_rgba(139,127,255,0.3)] transition-shadow">
                      <Eye className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold font-display text-white mb-2">Detector Mode</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      Six answers. One human. Identify which response is real, then verify the 0G cryptographic proofs on every AI seat.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-brand-violet font-bold font-mono group-hover:gap-3 transition-all">
                      COMMENCE DETECTION <ArrowRight className="w-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Hider card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.55, ease: [0.22,1,0.36,1] }}
                  whileHover={{ y: -6, rotateX: 3, rotateY: 3 }}
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  className="glass-card p-7 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-brand-green/40 transition-all shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
                  onClick={handleStartHider}
                >
                  <div className="absolute inset-0 neural-grid-cyan opacity-25 rounded-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-green/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-green/12 transition-colors" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-brand-green/12 border border-brand-green/25 flex items-center justify-center text-brand-green mb-5 group-hover:shadow-[0_0_25px_rgba(0,245,160,0.3)] transition-shadow">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold font-display text-white mb-2">Hider Mode</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      Be the human. Write an answer that blends in with the AIs. Your response gets shuffled anonymously into live rounds worldwide.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-brand-green font-bold font-mono group-hover:gap-3 transition-all">
                      GO UNDERCOVER <ArrowRight className="w-4" />
                    </div>
                  </div>
                </motion.div>
              </div>
 
              {/* Pack Selector block */}
              <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-gray-500 mb-3 block">
                  CHOOSE ACTIVE PROMPT PACK
                </h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {packs.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all border ${
                        selectedPack === pack.id
                          ? "bg-brand-violet text-black border-brand-violet hover:opacity-90 font-bold"
                          : "bg-black/25 hover:bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {pack.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* History & Statistics section */}
              <div className="max-w-3xl mx-auto pt-4">
                <HistoryStats
                  stats={stats}
                  onResetStats={handleResetStats}
                  onViewHistory={() => navTo("HISTORY")}
                />
              </div>

            </motion.div>
          )}

          {/* WAITING STATE ASSEMBLY SCREENS */}
          {appState === "WAITING" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WaitingScreen
                prompt={roundPrompt}
                packName={packs.find((p) => p.id === selectedPack)?.title || "Selected"}
                onCancel={goHome}
              />
            </motion.div>
          )}

          {/* DETECTOR TABLE */}
          {appState === "DETECTOR" && activeRound && (
            <motion.div
              key="detector-table"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto w-full relative z-10 px-2"
            >
              {/* Immersive Prompt Header */}
              <div className="mb-8 text-center max-w-3xl mx-auto">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-violet font-bold mb-3 block font-mono">
                  ACTIVE DETECTOR PROMPT
                </span>
                <h1 className="text-2xl md:text-3xl font-light text-white leading-tight font-display tracking-tight">
                  {activeRound.prompt}
                </h1>
              </div>

              {/* Spooky "REVEALING SUSPENSE" overlay */}
              <AnimatePresence>
                {revealingSuspense && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/95 backdrop-blur-md h-full z-30 flex flex-col items-center justify-center p-6 border border-white/5 rounded-2xl shadow-3xl"
                  >
                    <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-t-brand-violet border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <Database className="w-8 h-8 text-brand-violet animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-white tracking-widest uppercase animate-pulse">
                      RECORDING RESULT ON 0G
                    </h3>
                    <p className="text-gray-500 text-xs font-mono mt-1.5 text-center max-w-sm">
                      Verifying provider signatures and writing the round to 0G Storage and Chain...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suspect Answers Grid — 3D tilt cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {activeRound.seats.map((seat, idx) => {
                  const isChosen = selectedSeat === seat.seat;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] }}
                      whileHover={{ y: -4, rotateX: 2, rotateY: isChosen ? 0 : -2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
                      key={seat.seat}
                      onClick={() => setSelectedSeat(seat.seat)}
                      className={`group relative rounded-2xl p-6 flex flex-col justify-between min-h-[200px] cursor-pointer border transition-all ${
                        isChosen
                          ? 'bg-brand-violet/10 border-brand-violet shadow-[0_0_40px_rgba(139,127,255,0.2)]'
                          : 'glass-card hover:border-brand-violet/35'
                      }`}
                    >
                      {/* Ghost seat number */}
                      <div className="absolute bottom-4 right-4 text-[64px] font-black font-display leading-none text-white/[0.03] select-none pointer-events-none">
                        0{seat.seat + 1}
                      </div>

                      {/* Seat label */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] font-bold ${
                          isChosen ? 'text-brand-violet' : 'text-text-muted'
                        }`}>
                          SEAT 0{seat.seat + 1}
                        </span>
                        {isChosen && (
                          <motion.span
                            initial={{ opacity:0, scale:0.8 }}
                            animate={{ opacity:1, scale:1 }}
                            className="text-[8px] font-mono font-bold uppercase tracking-widest bg-brand-violet/20 border border-brand-violet/40 text-brand-violet px-2 py-0.5 rounded-full"
                          >
                            SUSPECT LOCKED
                          </motion.span>
                        )}
                      </div>

                      <p className="text-sm leading-relaxed text-text-primary font-sans flex-1">
                        {seat.text}
                      </p>

                      <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center">
                        <span className={`text-[9px] font-mono uppercase tracking-wider ${
                          isChosen ? 'text-brand-violet' : 'text-text-muted'
                        }`}>
                          {isChosen ? 'Suspect Selected' : 'Tap to suspect'}
                        </span>
                        {isChosen
                          ? <div className="flex gap-0.5"><span className="w-0.5 h-3 bg-brand-violet animate-pulse" /><span className="w-0.5 h-3 bg-brand-violet animate-pulse" /></div>
                          : <div className="w-2 h-2 rounded-full bg-white/15" />
                        }
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Custom Action Bar matching the design reference */}
              <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8 pb-4">
                <div className="flex flex-col text-center md:text-left">
                  <span className="text-[9px] uppercase text-gray-500 font-mono tracking-widest">Round ID</span>
                  <span className="text-xs font-mono text-white mt-1">
                    {activeRound.id.substring(0, 8)}…
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono mt-0.5">recorded on 0G after you vote</span>
                </div>

                <div>
                  <button
                    disabled={selectedSeat === null || isCastingVote}
                    onClick={handleLockInVote}
                    className={`px-10 py-3.5 text-xs font-black uppercase tracking-[0.2em] rounded-lg transition-all ${
                      selectedSeat === null
                        ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed uppercase"
                        : "bg-brand-violet text-black font-extrabold shadow-[0_0_25px_rgba(124,108,255,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
                    }`}
                  >
                    {selectedSeat === null ? "Select Suspect Above" : "Lock In Selection"}
                  </button>
                </div>

                <div className="flex space-x-8">
                  <div className="text-center md:text-right">
                    <span className="text-[9px] uppercase text-gray-500 font-bold block mb-1 tracking-wider">Inference</span>
                    <span className="text-xs text-white font-mono">PROVABLE_REAL</span>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="text-[9px] uppercase text-gray-500 font-bold block mb-1 tracking-wider font-mono">Models</span>
                    <span className="text-xs text-white font-mono">TEE-ATTESTED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REVEAL SCREEN — Cinematic 3-act ── */}
          {appState === "REVEAL" && votingResult && activeRound && (
            <motion.div
              key="reveal-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => {
                // Trigger confetti or shake after reveal mounts
                if (votingResult.correct) {
                  triggerConfetti();
                } else {
                  setShaking(true);
                  setTimeout(() => setShaking(false), 600);
                }
              }}
              className={`max-w-4xl mx-auto w-full space-y-8 ${shaking ? 'screen-shake' : ''}`}
            >
              {/* Confetti layer */}
              <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {confetti.map((p) => (
                  <div
                    key={p.id}
                    className="confetti-particle absolute w-2 h-2 rounded-sm"
                    style={{
                      left: `${p.x}%`,
                      top: '-10px',
                      backgroundColor: p.color,
                      animationDelay: `${Math.random() * 0.3}s`,
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <motion.span
                  initial={{ opacity:0, y:-8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.1 }}
                  className="font-mono text-xs text-text-muted uppercase tracking-[0.2em] font-semibold block mb-2"
                >
                  Identity Unsealed
                </motion.span>
                <motion.h2
                  initial={{ opacity:0, scale:0.92 }}
                  animate={{ opacity:1, scale:1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease:[0.22,1,0.36,1] }}
                  className={`text-4xl md:text-5xl font-extrabold font-display tracking-tight ${
                    votingResult.correct ? 'text-gradient-cyan' : 'text-brand-red'
                  }`}
                >
                  {votingResult.correct ? 'Human Identified.' : 'AI Won This Round.'}
                </motion.h2>
              </div>

              {/* Verdict Card Social Shareable block */}
              <VerdictCard
                prompt={activeRound.prompt}
                isCorrect={votingResult.correct}
                guessedSeat={votingResult.guessedSeat}
                humanSeat={votingResult.humanSeat}
                answers={votingResult.answers}
                verifiedCount={votingResult.verifiedCount}
                roundId={votingResult.roundId}
              />

              {/* Highlight seats breakdown list with true human vs true AI models */}
              <div className="space-y-4">
                <h3 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-widest">
                  Detailed Answers & 0G Verification Hash
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {votingResult.answers.map((answer) => {
                    const isHuman = answer.isHuman;
                    const isPicked = answer.seat === votingResult.guessedSeat;

                    return (
                      <div
                        key={answer.seat}
                        className={`border rounded-xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between min-h-48 ${
                          isHuman
                            ? "bg-brand-green/5 border-brand-green glow-green"
                            : "bg-dark-card border-dark-border"
                        }`}
                      >
                        {/* Seating number header */}
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-mono text-xs font-bold text-gray-400">
                            SEAT 0{answer.seat + 1}
                          </span>

                          <div className="flex flex-col items-end gap-1.5 font-mono">
                            {isHuman ? (
                              <span className="text-[10px] bg-brand-green/20 border border-brand-green/40 text-brand-green px-2 py-0.5 rounded uppercase font-bold tracking-widest flex items-center gap-1">
                                <Users className="w-3" /> Human
                              </span>
                            ) : (
                              <span className="text-[10px] bg-brand-blue/15 border border-brand-blue/30 text-brand-blue px-2 py-0.5 rounded uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Bot className="w-3" /> AI Model
                              </span>
                            )}

                            {isPicked && (
                              <span className="text-[9px] bg-white/10 text-white border border-white/20 px-1.5 rounded uppercase">
                                Your Guess
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Statement text display */}
                        <p className="flex-1 text-sm leading-relaxed mb-4 font-sans text-gray-200">
                          {answer.text}
                        </p>

                        {/* Footer revealing credentials */}
                        <div className="pt-2 border-t border-dark-border/30 flex justify-between items-center text-[10px] font-mono">
                          <span className="text-gray-400">
                            {isHuman ? (
                              "Live Global Input pool"
                            ) : (
                              <span className="text-brand-blue font-semibold uppercase">
                                {answer.personaId?.split(/[-_]/).slice(1).join(" ").toUpperCase() || "0G NODE"} model container
                              </span>
                            )}
                          </span>

                          {/* Cryptographically Sealed clickable badge */}
                          {answer.verified && (
                            <button
                              onClick={() => setProofModalOpen(true)}
                              className="text-brand-violet hover:text-white flex items-center gap-1 font-semibold hover:underline bg-brand-violet/5 border border-brand-violet/20 px-2 py-0.5 rounded cursor-pointer transition-all animate-pulse"
                            >
                              🔑 Verification Proof
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action row to continue playing */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                <button
                  onClick={() => setAppState("LOBBY")}
                  className="w-full sm:w-auto bg-dark-card hover:bg-dark-border border border-dark-border text-gray-300 font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Change Category / Mode
                </button>
                <button
                  onClick={() => setProofModalOpen(true)}
                  className="w-full sm:w-auto bg-dark-card hover:bg-dark-border border border-brand-violet/40 text-brand-violet font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-4 h-4" /> View 0G Proof
                </button>
                <button
                  onClick={() => handleStartDetector(selectedPack)}
                  className="w-full sm:w-auto bg-brand-violet hover:bg-brand-violet/90 text-white font-mono text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Play Another Round <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Integrated Proof modal dialog popup */}
              <ProofModal
                isOpen={proofModalOpen}
                onClose={() => setProofModalOpen(false)}
                storageRoot={votingResult.storageRoot || null}
                storageTx={votingResult.storageTx || null}
                chainTx={votingResult.chainTx || null}
                verifiedCount={votingResult.verifiedCount}
                prompt={activeRound.prompt}
              />
            </motion.div>
          )}

          {/* HIDER SCREEN */}
          {appState === "HIDER" && (
            <motion.div
              key="hider-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="text-center mb-6">
                <span className="font-mono text-xs text-brand-green uppercase tracking-widest font-semibold block">
                  Turing Blending Protocol
                </span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Blend with the algorithms
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Submit a highly human response. Our system encrypts it and shuffles it onto active detector maps played by real people around the globe.
                </p>
              </div>

              {/* Dynamic Hider Prompt details display */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
                  <span>Random Prompt assignment</span>
                  <button
                    onClick={handleRefreshHiderPrompt}
                    title="Get a new prompt question"
                    className="text-brand-green hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 animate-spin-hover" /> Skip prompt
                  </button>
                </div>
                <p className="text-lg font-medium font-display italic text-white text-center py-2">
                  {hiderPrompt || "Spawning prompt..."}
                </p>
              </div>

              {/* Structured Submission Input Form */}
              <form onSubmit={handleSubmitHider} className="space-y-4">
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                  <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-2">
                    <label htmlFor="hiderAnswer">Your Answer (be tactical, sound human!):</label>
                    <span className={hiderText.length > 135 ? "text-yellow-500" : ""}>
                      {hiderText.length} / 150
                    </span>
                  </div>
                  <textarea
                    id="hiderAnswer"
                    required
                    placeholder="Type your answer in one short sentence..."
                    maxLength={150}
                    value={hiderText}
                    onChange={(e) => setHiderText(e.target.value)}
                    className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green resize-none leading-relaxed transition-all"
                  />
                </div>

                {/* Confirm submit buttons */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setAppState("LOBBY")}
                    className="bg-dark-card hover:bg-dark-border border border-dark-border text-gray-400 font-mono text-xs font-bold uppercase py-3 px-6 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!hiderText.trim() || isSubmittingHider}
                    className={`px-8 py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all ${
                      !hiderText.trim()
                        ? "bg-dark-card border border-dark-border text-gray-600"
                        : "bg-brand-green hover:bg-brand-green/90 text-black shadow-lg"
                    }`}
                  >
                    {isSubmittingHider ? (
                      <>
                        <RefreshCw className="w-4 animate-spin" /> Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4" /> Broadcast Anonymous Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* HIDER SUCCESS CONFIRMATION SCREEN */}
          {appState === "HIDER_SUCCESS" && (
            <motion.div
              key="hider-success-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto w-full bg-dark-card border border-dark-border rounded-2xl p-6 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-green glow-green" />

              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-green/20 border-2 border-brand-green text-brand-green flex items-center justify-center glow-green">
                  <Check className="w-8 h-8" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-white tracking-tight">
                  Answer Added to the Pool
                </h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  Your answer is now in the live pool. It'll be shuffled into future detector rounds for other players to try to spot among the AIs.
                </p>
              </div>

              {/* Micro-terminal details logs */}
              <div className="bg-black/80 border border-dark-border p-3.5 rounded-xl text-left font-mono text-[10px] text-gray-500 space-y-1">
                <p className="text-brand-green">▶ ANSWER QUEUED</p>
                <p>▶ STATUS: ADDED_TO_POOL</p>
                <p>▶ PACK: {selectedPack.toUpperCase()}</p>
                <p>▶ WILL SEED FUTURE DETECTOR ROUNDS</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setAppState("LOBBY")}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-black font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-xl cursor-pointer transition-colors"
                >
                  Return to Main Lobby
                </button>
              </div>
            </motion.div>
          )}

          {/* HOW TO PLAY */}
          {appState === "HOWTO" && (
            <motion.div key="howto" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <HowToPlay onBack={goHome} onPlay={goHome} />
            </motion.div>
          )}

          {/* ABOUT */}
          {appState === "ABOUT" && (
            <motion.div key="about" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <About onBack={goHome} />
            </motion.div>
          )}

          {/* HISTORY */}
          {appState === "HISTORY" && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <HistoryPage history={history} stats={stats} onClear={handleResetStats} onBack={goHome} />
            </motion.div>
          )}

          {/* ROADMAP */}
          {appState === "ROADMAP" && (
            <motion.div key="roadmap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Roadmap onBack={goHome} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-5 px-6 relative z-10 mt-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand-violet rounded flex items-center justify-center">
              <span className="text-black font-black text-xs font-display">M</span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">MINDFEINT © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono text-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />0G GALILEO TESTNET</span>
            <span>·</span>
            <span>TEE-ATTESTED INFERENCE</span>
            <span>·</span>
            <span>ERC-4337 WALLETS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
