import React from 'react';
import { RecurringCharge, CancellationPolicy, Currency } from '../../types/analysis.js';
import { RefreshCw, Calendar, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SubscriptionIntelCardProps {
  recurringCharges: RecurringCharge[];
  cancellationPolicy: CancellationPolicy;
  currency: Currency;
}

export const SubscriptionIntelCard: React.FC<SubscriptionIntelCardProps> = ({
  recurringCharges,
  cancellationPolicy,
  currency,
}) => {
  const hasRecurring = recurringCharges && recurringCharges.length > 0;

  return (
    <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface border border-lime/30 flex items-center justify-center text-lime">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ivory tracking-tight">
              Subscription & Recurring Terms
            </h3>
            <p className="text-xs text-zinc-400">
              Future recurring charges and cancellation constraints.
            </p>
          </div>
        </div>
      </div>

      {hasRecurring ? (
        <div className="space-y-3">
          {recurringCharges.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2 text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ivory uppercase tracking-wider text-[11px] font-mono">
                  Billing Cycle: {rec.billingCycle}
                </span>
                <span className="font-mono font-bold text-red-400">
                  {rec.amountAfterTrial ? `${currency} ${rec.amountAfterTrial}` : 'Fee Unstated'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-400 pt-1">
                <div>
                  <span className="text-zinc-500">Trial Period:</span>{' '}
                  <span className="text-zinc-200">
                    {rec.trialPeriodDays ? `${rec.trialPeriodDays} days` : 'No trial / Immediate'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Auto-Renewal:</span>{' '}
                  <span className="text-zinc-200">
                    {rec.autoRenewal ? 'Automatic Renewal Enabled' : 'Manual Renewal'}
                  </span>
                </div>
              </div>

              {rec.evidenceQuote && (
                <div className="p-2 rounded bg-graphite text-[11px] font-mono text-zinc-300 italic">
                  "{rec.evidenceQuote}"
                </div>
              )}
            </div>
          ))}

          {/* Cancellation Constraints */}
          <div className="p-3.5 rounded-xl bg-surface border border-borderMuted text-xs space-y-1">
            <div className="font-semibold text-ivory flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-lime" />
              Cancellation Terms
            </div>
            <p className="text-zinc-300">
              Advance notice required:{' '}
              <span className="font-medium text-ivory">
                {cancellationPolicy.cancellationNoticeDays
                  ? `${cancellationPolicy.cancellationNoticeDays} days before renewal`
                  : 'Undisclosed by merchant'}
              </span>
            </p>
            {cancellationPolicy.penaltyFee !== null && (
              <p className="text-zinc-300">
                Cancellation penalty fee: {currency} {cancellationPolicy.penaltyFee}
              </p>
            )}
            {cancellationPolicy.evidenceQuote && (
              <div className="text-[11px] text-zinc-400 font-mono italic mt-1">
                "{cancellationPolicy.evidenceQuote}"
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-surface/50 border border-borderSubtle text-xs text-zinc-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No automatic recurring subscription clauses found in the analyzed data.</span>
        </div>
      )}
    </div>
  );
};
