import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { TrueCostCalculation, Currency } from '../../types/analysis.js';
import { AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

interface TrueCostCardProps {
  trueCost?: TrueCostCalculation;
  currency: Currency;
  advertisedPrice: number;
}

export const TrueCostCard: React.FC<TrueCostCardProps> = ({
  trueCost,
  currency,
  advertisedPrice,
}) => {
  const confirmedTotal = trueCost?.confirmedTotal || advertisedPrice;
  const totalExtra = trueCost?.totalConfirmedCharges || 0;
  const chartData = trueCost?.chargesBreakdown || [
    { category: 'Base Price', amount: advertisedPrice, confirmed: true },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 border border-borderMuted space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-borderMuted">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-lime font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            True Cost Calculation
          </div>
          <h3 className="text-xl font-bold text-ivory tracking-tight mt-0.5">
            Transparent Pricing Breakdown
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">Confirmed Checkout Total</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-lime font-mono">
            {currency} {confirmedTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <div className="text-zinc-500 mb-0.5">Advertised Price</div>
          <div className="text-base font-bold text-ivory font-mono">
            {currency} {advertisedPrice.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Merchant listing price</span>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <div className="text-zinc-500 mb-0.5">Confirmed Extra Fees</div>
          <div className="text-base font-bold text-amber-400 font-mono">
            +{currency} {totalExtra.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Taxes, shipping & handling</span>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <div className="text-zinc-500 mb-0.5">Estimated Max Total</div>
          <div className="text-base font-bold text-zinc-300 font-mono">
            {trueCost?.maximumEstimatedTotal
              ? `${currency} ${trueCost.maximumEstimatedTotal.toLocaleString()}`
              : 'Indeterminate'}
          </div>
          <span className="text-[10px] text-zinc-500">With conditional charges</span>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
          <div className="text-zinc-500 mb-0.5">Recurring Commitments</div>
          <div className="text-base font-bold text-red-400 font-mono">
            {trueCost?.recurringMonthlyEquivalent
              ? `${currency} ${trueCost.recurringMonthlyEquivalent}/mo`
              : 'None Detected'}
          </div>
          <span className="text-[10px] text-zinc-500">Future renewals</span>
        </div>
      </div>

      {/* Recharts Visual Breakdown */}
      <div>
        <h4 className="text-xs font-mono uppercase text-zinc-400 mb-3">
          Visual Cost Composition
        </h4>
        <div className="h-48 w-full bg-graphite/60 rounded-xl p-3 border border-borderSubtle">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="category" tick={{ fill: '#8E929E', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8E929E', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-charcoal border border-borderMuted p-2.5 rounded-lg text-xs shadow-xl font-mono">
                        <div className="text-ivory font-bold">{item.category}</div>
                        <div className="text-lime">
                          {currency} {item.amount}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {item.confirmed ? 'Confirmed Charge' : 'Conditional / Estimated'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.confirmed ? (index === 0 ? '#FFFFFF' : '#D4FF00') : '#F59E0B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Uncertainty Disclaimer */}
      {trueCost?.hasUncertainCharges && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Conditional charges present:</span> Certain fees (such as potential restocking deductions or courier return postage) depend on merchant conditions and are excluded from the confirmed upfront total.
          </div>
        </div>
      )}
    </div>
  );
};
