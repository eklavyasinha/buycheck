import React, { useState, useEffect } from 'react';
import { AnalysisAPI } from '../../services/api.js';
import { ProtectionEvaluation, StructuredAnalysis } from '../../types/analysis.js';
import { ShieldCheck, ShieldAlert, HelpCircle, ExternalLink, Info } from 'lucide-react';

interface PayPalProtectionCardProps {
  analysisId: string;
}

export const PayPalProtectionCard: React.FC<PayPalProtectionCardProps> = ({ analysisId }) => {
  const [evaluation, setEvaluation] = useState<ProtectionEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProtection() {
      try {
        const data = await AnalysisAPI.getProtection(analysisId);
        setEvaluation(data);
      } catch (err) {
        console.warn('Failed to load protection evaluation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProtection();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-borderMuted text-xs text-zinc-400">
        Loading PayPal Buyer Protection eligibility factors...
      </div>
    );
  }

  if (!evaluation) return null;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 border border-borderMuted space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/30 flex items-center justify-center text-[#0070BA]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ivory tracking-tight">
              PayPal Purchase Protection Assessment
            </h3>
            <p className="text-xs text-zinc-400">
              Informational evaluation based on published PayPal User Agreement criteria.
            </p>
          </div>
        </div>
        <a
          href={evaluation.officialPolicyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#0070BA] hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Official Policy</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Factors List */}
      <div className="space-y-2.5">
        {evaluation.protectionFactors.map((factor, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-surface border border-borderSubtle text-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ivory">{factor.title}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  factor.status === 'supported'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : factor.status === 'unsupported'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {factor.status}
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">{factor.description}</p>
            <div className="text-[10px] font-mono text-zinc-500">
              Ref: {factor.officialReference}
            </div>
          </div>
        ))}
      </div>

      {/* Limitations */}
      {evaluation.limitations.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
          <span className="font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Important Exclusions & Caveats
          </span>
          <ul className="list-disc pl-5 space-y-0.5 text-zinc-300 text-[11px]">
            {evaluation.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Regulatory & Uncertainty Disclaimer */}
      <div className="p-3 rounded-xl bg-graphite border border-borderSubtle text-[11px] text-zinc-400 leading-relaxed">
        <span className="text-zinc-300 font-semibold block mb-0.5">Disclaimer:</span>
        {evaluation.disclaimer}
      </div>
    </div>
  );
};
