import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Database, Link2, ExternalLink, Globe, Cpu, CpuIcon } from "lucide-react";

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageRoot: string | null;
  storageTx: string | null;
  chainTx: string | null;
  verifiedCount: number;
  prompt: string;
}

export default function ProofModal({
  isOpen,
  onClose,
  storageRoot,
  storageTx,
  chainTx,
  verifiedCount,
  prompt,
}: ProofModalProps) {
  if (!isOpen) return null;

  // The storage root is a Merkle content-id, not a transaction — so we link the
  // on-chain COMMIT tx (which resolves on the explorer) and show the root as the id.
  const storageScanUrl = storageTx
    ? `https://chainscan-galileo.0g.ai/tx/${storageTx}`
    : "#";
  const chainScanUrl = chainTx
    ? `https://chainscan-galileo.0g.ai/tx/${chainTx}`
    : "#";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.9, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 15, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 p-6 md:p-8"
        >
          {/* Neon violet top glow border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-violet via-brand-blue to-brand-green" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-dark-bg hover:bg-dark-border text-gray-400 hover:text-white p-1.5 rounded-full transition-colors font-mono cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title & Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-brand-green glow-green">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] tracking-widest text-brand-violet uppercase font-semibold bg-brand-violet/10 border border-brand-violet/20 px-2 py-0.5 rounded">
                  0G Web3 Provenance
                </span>
                <span className="text-xs font-mono text-green-400 font-medium">● SYSTEM AUDITED</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                Cryptographic Integrity Certificate
              </h2>
            </div>
          </div>

          {/* Clarify scope: these transactions cover the whole round, not one answer. */}
          <p className="text-xs text-gray-400 leading-relaxed mb-5 -mt-2">
            This is the record for the <b className="text-white">whole round</b> — all six
            answers and each one's verification are stored together, so every answer shares
            these same two transactions. Each AI answer is also individually checked by the
            0G TEE at generation time (the <span className="text-brand-green">✓ verified</span> tag).
          </p>

          {/* Verifiable Inference Prompt Section */}
          <div className="bg-dark-bg border border-dark-border rounded-lg p-3 mb-6">
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block mb-1">
              PROMPT PAYLOAD DIGEST:
            </span>
            <p className="text-sm italic text-gray-300 font-display">
              {prompt}
            </p>
          </div>

          {/* Interactive Flow Schematic */}
          <h3 className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Verifiable Inference Architecture Stack:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8 relative">
            {/* Visual connecting bars for desktop */}
            <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-dark-border/80 -translate-y-4 -z-10" />

            <div className="bg-dark-bg border border-dark-border rounded-lg p-3 text-center flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/40 flex items-center justify-center text-brand-blue mb-2 font-mono text-xs font-bold">
                01
              </div>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                0G Models
              </span>
              <span className="text-[9px] text-gray-500 mt-1">
                Parallel inference on decentralized GPU clusters
              </span>
            </div>

            <div className="bg-dark-bg border border-dark-border rounded-lg p-3 text-center flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-violet/10 border border-brand-violet/40 flex items-center justify-center text-brand-violet mb-2 font-mono text-xs font-bold font-mono">
                02
              </div>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                TEE Attestation
              </span>
              <span className="text-[9px] text-gray-500 mt-1">
                Provider signs each response inside a trusted enclave
              </span>
            </div>

            <div className="bg-dark-bg border border-dark-border rounded-lg p-3 text-center flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green/10 border border-brand-green/40 flex items-center justify-center text-brand-green mb-2 font-mono text-xs font-bold">
                03
              </div>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                0G Storage
              </span>
              <span className="text-[9px] text-gray-500 mt-1">
                Answers stored permanently on independent file nodes
              </span>
            </div>

            <div className="bg-dark-bg border border-dark-border rounded-lg p-3 text-center flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center text-yellow-500 mb-2 font-mono text-xs font-bold">
                04
              </div>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                0G Chain Registry
              </span>
              <span className="text-[9px] text-gray-500 mt-1">
                Verification hash state stamped on-chain permanently
              </span>
            </div>
          </div>

          {/* Audit Verification Details / Scanning links */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">
              Scan Explorer Receipts (Galileo Testnet)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Storage hash receipt card */}
              <div className="bg-dark-bg border border-dark-border rounded-lg p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-brand-green">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-mono font-medium text-white">0G Storage Node</span>
                  </div>
                  <span className="text-[10px] bg-green-500/10 text-brand-green border border-green-500/20 px-1.5 py-0.5 rounded font-mono">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">content id (root):</p>
                <p className="text-[10px] font-mono text-gray-400 break-all bg-black/40 p-2.5 rounded border border-dark-border/40 mt-1 select-all mb-4">
                  {storageRoot || "round not stored (indexer slow)"}
                </p>
                {storageTx ? (
                  <a
                    href={storageScanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 self-start text-xs font-mono text-brand-violet hover:text-white font-semibold group cursor-pointer"
                  >
                    View commit transaction <ExternalLink className="w-3 transition-transform group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <span className="text-[10px] font-mono text-gray-600">no commit tx for this round</span>
                )}
              </div>

              {/* Chain txn state receipt card */}
              <div className="bg-dark-bg border border-dark-border rounded-lg p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-brand-blue">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-mono font-medium text-white">Galileo Chain Attestation</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-brand-blue border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                    STAMPED
                  </span>
                </div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">attestation tx:</p>
                <p className="text-[10px] font-mono text-gray-400 break-all bg-black/40 p-2.5 rounded border border-dark-border/40 mt-1 select-all mb-4">
                  {chainTx || "not attested for this round"}
                </p>
                {chainTx ? (
                  <a
                    href={chainScanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 self-start text-xs font-mono text-brand-blue hover:text-white font-semibold group cursor-pointer"
                  >
                    Verify attestation tx <ExternalLink className="w-3 transition-transform group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <span className="text-[10px] font-mono text-gray-600">attestation pending / unavailable</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer certification details */}
          <div className="mt-6 pt-4 border-t border-dark-border flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-3">
            <span className="text-[10px] font-mono text-gray-500">
              Generated in decentralized round: <b className="text-gray-300">verified state</b>
            </span>
            <button
              onClick={onClose}
              className="bg-brand-violet hover:bg-brand-violet/80 text-white font-mono text-xs font-bold px-4 py-1.5 rounded cursor-pointer transition-colors"
            >
              Auditing Complete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
