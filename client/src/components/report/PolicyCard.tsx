import React from 'react';
import { ReturnPolicy, Currency } from '../../types/analysis.js';
import { RotateCcw, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PolicyCardProps {
  returnPolicy: ReturnPolicy;
  missingInformation: string[];
  currency: Currency;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  returnPolicy,
  missingInformation,
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface border border-lime/30 flex items-center justify-center text-lime">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ivory tracking-tight">
              Return & Refund Policy
            </h3>
            <p className="text-xs text-zinc-400">
              Return window duration, restocking penalties & shipping responsibility.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <span className="text-zinc-500 block mb-1">Return Window</span>
          <span className="text-sm font-bold text-ivory">
            {returnPolicy.returnWindowDays
              ? `${returnPolicy.returnWindowDays} Days`
              : 'Undisclosed'}
          </span>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <span className="text-zinc-500 block mb-1">Restocking Fee</span>
          <span className="text-sm font-bold text-ivory">
            {returnPolicy.restockingFeePercent !== null
              ? `${returnPolicy.restockingFeePercent}% Deduction`
              : 'None Stated'}
          </span>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <span className="text-zinc-500 block mb-1">Return Transit Payer</span>
          <span className="text-sm font-bold text-ivory capitalize">
            {returnPolicy.returnShippingPaidBy === 'seller'
              ? 'Free (Seller Pays)'
              : returnPolicy.returnShippingPaidBy === 'buyer'
              ? 'Buyer Pays'
              : 'Undisclosed'}
          </span>
        </div>
      </div>

      {returnPolicy.evidenceQuote && (
        <div className="p-3 rounded-xl bg-graphite border border-borderSubtle text-xs font-mono text-zinc-300 italic">
          "{returnPolicy.evidenceQuote}"
        </div>
      )}

      {/* Missing Information Checklist */}
      {missingInformation && missingInformation.length > 0 && (
        <div className="pt-2 border-t border-borderMuted">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
            Important Information Undisclosed By Merchant ({missingInformation.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {missingInformation.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-surface/50 p-2 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
