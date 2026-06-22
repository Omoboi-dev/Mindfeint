import { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Share2, Award, ChevronRight, ShieldCheck, HeartCrack, HelpCircle } from "lucide-react";
import { RevealAnswer } from "../types";

interface VerdictCardProps {
  prompt: string;
  isCorrect: boolean;
  guessedSeat: number;
  humanSeat: number;
  answers: RevealAnswer[];
  verifiedCount: number;
  roundId: string;
}

export default function VerdictCard({
  prompt,
  isCorrect,
  guessedSeat,
  humanSeat,
  answers,
  verifiedCount,
  roundId,
}: VerdictCardProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSeat, setExpandedSeat] = useState<number | null>(null);

  // Generate a beautiful Unicode game summary block for Discord/Twitter sharing
  const generateShareText = () => {
    let emojiRounds = "";
    answers.forEach((ans) => {
      if (ans.isHuman) {
        if (guessedSeat === ans.seat) {
          emojiRounds += "🟢 [Human - SPOTTED] ";
        } else {
          emojiRounds += "🟢 [Human - FOOLED] ";
        }
      } else {
        if (guessedSeat === ans.seat) {
          emojiRounds += "🔴 [AI - WRONG ACCUSA] ";
        } else {
          emojiRounds += "⚫ [AI Node Verified] ";
        }
      }
      emojiRounds += `Seat ${ans.seat + 1}\n`;
    });

    const titleText = isCorrect
      ? "🎯 I successfully spotted the real human among AIs on Mindfeint!"
      : "🫢 Fool's Gold! An AI model successfully deceived me on Mindfeint.";

    return `${titleText}

Prompt: "${prompt}"

${emojiRounds}
🛡️ ${verifiedCount} AI answers verified on 0G — TEE-attested verifiable inference, recorded on 0G Storage + Chain.
🔗 Verifiable Proof: https://storagescan-galileo.0g.ai
Play here: https://mindfeint.ai (verifiable social deduction)`;
  };

  const handleCopy = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-dark-bg/85 border border-dark-border rounded-xl p-6 glow-violet relative overflow-hidden" id="verdict-card">
      {/* Background radial highlight gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hex pattern details in corners */}
      <div className="absolute top-2 right-2 text-dark-border font-mono text-[8px] tracking-widest uppercase">
        REF_ID: {roundId}
      </div>

      <div className="text-center mb-6 relative">
        <div className="flex justify-center mb-3">
          {isCorrect ? (
            <div className="w-16 h-16 rounded-full bg-brand-green/20 border-2 border-brand-green flex items-center justify-center text-brand-green glow-green">
              <Award className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 glow-red">
              <HeartCrack className="w-8 h-8" />
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold font-display text-white tracking-tight">
          {isCorrect ? (
            <span className="text-brand-green">SENSORY ACUITY VERIFIED</span>
          ) : (
            <span className="text-red-400">AI DECEPTION DETECTED</span>
          )}
        </h3>

        <p className="text-gray-400 text-xs mt-1 px-4">
          {isCorrect
            ? "You distinguished human consciousness from provably real cryptographic models."
            : `Seat ${guessedSeat + 1} fooled you. The real human was in Seat ${humanSeat + 1}.`}
        </p>
      </div>

      {/* Grid summarizing seat layouts */}
      <div className="space-y-3 bg-dark-card/60 rounded-xl p-4 border border-dark-border/40 mb-6 font-mono text-xs">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold border-b border-dark-border/50 pb-1.5 mb-2">
          Verdict Scoreboard <span className="text-gray-600 normal-case tracking-normal">· tap an answer to read it</span>
        </span>

        {answers.map((ans) => {
          const isGuessed = ans.seat === guessedSeat;
          const isHumanSeat = ans.isHuman;
          const isOpen = expandedSeat === ans.seat;

          return (
            <button
              type="button"
              key={ans.seat}
              onClick={() => setExpandedSeat(isOpen ? null : ans.seat)}
              className={`w-full text-left flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                isHumanSeat
                  ? "bg-brand-green/10 border-brand-green/30 text-brand-green"
                  : isGuessed
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-dark-bg/40 border-dark-border/20 text-gray-300 hover:border-brand-violet/40"
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-xs">Seat {ans.seat + 1}</span>
                <div className="flex items-center gap-2 font-semibold">
                  {isGuessed && (
                    <span className="text-[9px] bg-red-500/10 border border-red-500/30 px-1 rounded uppercase tracking-wider text-red-400">
                      Your Selection
                    </span>
                  )}
                  {isHumanSeat ? (
                    <span className="text-[9px] bg-brand-green/20 border border-brand-green/40 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">
                      Real Human
                    </span>
                  ) : (
                    <span className="text-[9px] bg-brand-blue/10 border border-brand-blue/20 px-1.5 py-0.5 rounded text-brand-blue uppercase tracking-wider">
                      0G AI
                    </span>
                  )}
                </div>
              </div>
              <p
                className={`text-sm font-sans italic leading-relaxed text-gray-200 ${
                  isOpen ? "" : "line-clamp-1"
                }`}
              >
                {ans.text}
              </p>
            </button>
          );
        })}
      </div>

      {/* Social meta badge details */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4 sm:items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-violet" />
          <div className="text-left">
            <p className="text-xs font-semibold text-white">{verifiedCount} of 5 AI answers verified on 0G</p>
            <p className="text-[10px] text-gray-500 font-mono">TEE-attested · recorded on 0G Storage + Chain</p>
          </div>
        </div>

        {/* Action Share elements */}
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            copied
              ? "bg-brand-green text-black"
              : "bg-brand-violet text-white hover:bg-brand-violet/90"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5" /> Verdict Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5" /> Share social verdict
            </>
          )}
        </button>
      </div>
    </div>
  );
}
