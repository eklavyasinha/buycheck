import React from 'react';
import { DarkPatternFinding } from '../../types/analysis.js';
import { ShieldAlert, AlertTriangle, AlertCircle, Quote } from 'lucide-react';

interface DarkPatternCardProps {
  darkPatterns: DarkPatternFinding[];
}

export const DarkPatternCard: React.FC<DarkPatternCardProps> = ({ darkPatterns }) => {
  if (!darkPatterns || darkPatterns.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-borderMuted">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
          <ShieldAlert className="w-4 h-4" />
          No Deceptive Dark Patterns Detected
        </div>
        <p className="text-xs text-zinc-400">
          The analyzed text does not exhibit known hidden subscription switches, deceptive trial countdowns, or pre-selected paid add-ons.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 border border-borderMuted space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ivory tracking-tight">
              Deceptive Patterns & Traps ({darkPatterns.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Evidence-grounded audit of misleading checkout and renewal tactics.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {darkPatterns.map((dp, idx) => {
          const isHigh = dp.severity === 'high';
          const isMed = dp.severity === 'medium';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isHigh
                  ? 'bg-red-500/10 border-red-500/30'
                  : isMed
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-surface border-borderMuted'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {isHigh ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <h4 className="text-sm font-bold text-ivory">{dp.title}</h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isHigh
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {dp.severity} Risk
                </span>
              </div>

              {/* Verbatim Evidence Quote */}
              <div className="my-2.5 p-3 rounded-lg bg-graphite/70 border border-borderSubtle text-xs font-mono text-zinc-300 italic flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>"{dp.evidenceQuote}"</span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-zinc-300 leading-relaxed">
                  <span className="font-semibold text-ivory">Explanation:</span> {dp.explanation}
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-200">Consumer Impact:</span>{' '}
                  {dp.potentialImpact}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
