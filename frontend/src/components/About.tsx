/**
 * MINDFEINT — About page.
 */
import { Cpu, Database, Globe, ArrowLeft } from "lucide-react";

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white p-2 rounded-lg cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">About Mindfeint</h2>
      </div>

      <p className="text-gray-300 leading-relaxed text-lg">
        <span className="text-brand-violet font-semibold">Mindfeint</span> is a social-deduction game where one of six
        answers is a real person and the rest are AIs pretending to be them. The twist: the AIs are{" "}
        <b className="text-white">provably real</b>.
      </p>

      <p className="text-gray-400 leading-relaxed">
        Every social "spot the bot" game asks you to trust the house — was that really an AI, or a human plant? a
        genuine model, or a cheap script? Mindfeint removes the trust. It's built on <b className="text-white">0G</b>,
        the only stack that lets a game prove its AI players are genuine and untampered.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <Cpu className="w-6 h-6 text-brand-blue mb-3" />
          <h3 className="text-sm font-bold text-white font-display mb-1">0G Compute</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Verifiable inference — every AI answer is signed in a TEE so it's provably from a real model.</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <Database className="w-6 h-6 text-brand-green mb-3" />
          <h3 className="text-sm font-bold text-white font-display mb-1">0G Storage</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Every round's full record is stored immutably and is publicly retrievable.</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <Globe className="w-6 h-6 text-yellow-500 mb-3" />
          <h3 className="text-sm font-bold text-white font-display mb-1">0G Chain</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Each record is anchored on-chain, so results can't be quietly rigged.</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 font-mono border-t border-dark-border pt-5">
        Built for The Zero Cup on 0G · Galileo testnet. You can't run a fair AI game if you can't prove the AIs are real.
      </p>
    </div>
  );
}
