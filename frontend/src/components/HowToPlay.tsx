/**
 * MINDFEINT — How to Play page.
 */
import { Eye, UserCheck, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";

export default function HowToPlay({ onBack, onPlay }: { onBack: () => void; onPlay: () => void }) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white p-2 rounded-lg cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">How to Play</h2>
      </div>

      <p className="text-gray-300 leading-relaxed">
        Every round is a table of <b className="text-white">6 answers</b> to one prompt. Five are written by AI
        personas; <b className="text-white">one is a real person</b>. Your job is to tell them apart.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="w-11 h-11 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet mb-4">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-white mb-2">Detector Mode</h3>
          <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Read all 6 anonymized answers.</li>
            <li>Pick the seat you think is the real human.</li>
            <li>Lock it in — then see who was who, with the 0G proofs.</li>
          </ol>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="w-11 h-11 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-white mb-2">Hider Mode</h3>
          <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>You're the human. Write an answer to the prompt.</li>
            <li>Try to sound like you'd blend in with the AIs.</li>
            <li>It gets shuffled into other players' rounds to fool them.</li>
          </ol>
        </div>
      </div>

      <div className="bg-dark-bg/60 border border-brand-violet/20 rounded-2xl p-6 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-brand-violet shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-bold text-white mb-1">Why it's provably fair</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Every AI answer is produced by a real model on <b className="text-white">0G verifiable inference</b> and
            signed inside a TEE — so no one can fake a bot or rig the result. Each round is recorded on 0G Storage and
            anchored on 0G Chain, and you can open the on-chain proof from any reveal.
          </p>
        </div>
      </div>

      <button
        onClick={onPlay}
        className="w-full sm:w-auto bg-brand-violet hover:bg-brand-violet/90 text-white font-mono text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-2xl cursor-pointer transition-all flex items-center justify-center gap-2"
      >
        Start playing <ArrowRight className="w-4" />
      </button>
    </div>
  );
}
