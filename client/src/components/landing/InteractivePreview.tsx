import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  ShieldAlert,
  Play,
  Pause,
} from 'lucide-react';

interface Stage {
  step: number;
  title: string;
  badge: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    step: 1,
    title: 'Extracting Merchant Data',
    badge: 'Raw Extraction',
    description: 'Scanning title, cart specifications, terms & checkout clauses.',
  },
  {
    step: 2,
    title: 'Advertised Price Identified',
    badge: 'Initial Price',
    description: 'Merchant prominently advertises item as ₹4,999.',
  },
  {
    step: 3,
    title: 'Additional Charges Highlighted',
    badge: '+₹1,048.82 Extras',
    description: 'Uncovered 18% GST and mandatory ₹149 fragile courier fee.',
  },
  {
    step: 4,
    title: 'Hidden Subscription Trap Detected',
    badge: 'Recurring Alert',
    description: '7-day trial auto-renews at ₹999/month unless cancelled 48h prior.',
  },
  {
    step: 5,
    title: 'Restocking & Return Risk Flagged',
    badge: '15% Deduction',
    description: '15% restocking fee on opened boxes; buyer pays return transit.',
  },
  {
    step: 6,
    title: 'True Cost Calculated',
    badge: '₹6,047.82 Confirmed',
    description: 'Advertised ₹4,999 is actually ₹6,047.82 upfront + ₹999 monthly recurring.',
  },
  {
    step: 7,
    title: 'Final Actionable Recommendation',
    badge: 'REVIEW BEFORE PAY',
    description: 'Rule violation alert: Violates user rule "No automatic subscriptions".',
  },
];

export const InteractivePreview: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev >= 7 ? 1 : prev + 1));
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStage = STAGES[currentStep - 1];

  return (
    <div id="interactive-preview" className="w-full max-w-5xl mx-auto my-16 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-lime/10 text-lime border border-lime/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Analysis Demonstration
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-ivory tracking-tight">
            Watch BuyCheck In Action
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            See how deceptive pricing, hidden renewals, and fine print are exposed step-by-step.
          </p>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-lime/40 text-xs font-medium text-zinc-300 hover:text-ivory transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-lime" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-lime" />
                <span>Play</span>
              </>
            )}
          </button>
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-lime/40 text-xs font-medium text-zinc-300 hover:text-ivory transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Stepper Tabs */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6">
        {STAGES.map((s) => {
          const isActive = s.step === currentStep;
          const isDone = s.step < currentStep;
          return (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStep(s.step);
                setIsPlaying(false);
              }}
              className={`text-left p-2 rounded-lg border transition-all ${
                isActive
                  ? 'bg-charcoal border-lime text-lime shadow-sm lime-glow-subtle'
                  : isDone
                  ? 'bg-surface/60 border-zinc-700/50 text-zinc-300'
                  : 'bg-surface/30 border-borderSubtle text-zinc-600'
              }`}
            >
              <div className="text-[10px] font-mono font-medium">0{s.step}</div>
              <div className="hidden md:block text-[11px] font-medium truncate mt-0.5">
                {s.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Display */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-borderMuted relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Stage Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-surface-elevated border border-borderMuted text-lime">
              Stage {activeStage.step} of 7: {activeStage.badge}
            </div>

            <h4 className="text-2xl font-bold text-ivory tracking-tight">
              {activeStage.title}
            </h4>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {activeStage.description}
            </p>

            {/* Stage Indicator Pill */}
            <div className="pt-2">
              <div className="text-xs font-mono text-zinc-400 mb-1">Demonstration Item:</div>
              <div className="text-xs font-medium text-zinc-200 bg-surface px-3 py-2 rounded-lg border border-borderMuted">
                CloudAudio Pro ANC Wireless Headphones + 7-Day Trial VIP Pass
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Card with Dynamic Overlays */}
          <div className="lg:col-span-7">
            <div className="bg-graphite rounded-xl p-5 border border-borderMuted space-y-4 font-sans relative">
              {/* Mockup Browser/Page Header */}
              <div className="flex items-center justify-between pb-3 border-b border-borderMuted text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-zinc-400">cloudaudio.shop/checkout</span>
                </div>
                <span className="text-[10px] font-mono text-lime bg-lime/10 px-2 py-0.5 rounded">
                  BuyCheck Inspector Active
                </span>
              </div>

              {/* Product Row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h5 className="font-semibold text-ivory text-sm">
                    CloudAudio Pro ANC Headphones
                  </h5>
                  <p className="text-xs text-zinc-400">Midnight Matte • Wireless 5.3</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-ivory">₹4,999.00</div>
                  <div className="text-[11px] text-zinc-400 line-through">₹7,999.00</div>
                </div>
              </div>

              {/* Dynamic Animated Breakdown according to current step */}
              <div className="space-y-2 pt-2 border-t border-borderMuted text-xs">
                {/* Advertised Price */}
                <div className="flex justify-between text-zinc-300">
                  <span>Advertised Base Price:</span>
                  <span className="font-mono">₹4,999.00</span>
                </div>

                {/* Additional Charges (Step >= 3) */}
                <AnimatePresence>
                  {currentStep >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <div className="flex justify-between text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Goods & Services Tax (GST 18%):
                        </span>
                        <span className="font-mono font-medium">+₹899.82</span>
                      </div>
                      <div className="flex justify-between text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Mandatory Courier Packaging:
                        </span>
                        <span className="font-mono font-medium">+₹149.00</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subscription Trap (Step >= 4) */}
                <AnimatePresence>
                  {currentStep >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/10 border border-red-500/30 text-red-300 p-2.5 rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-red-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        Trap: Pre-Selected 7-Day VIP Trial
                      </div>
                      <div className="text-[11px] text-red-300/90 leading-tight">
                        Evidence quote: "Renews automatically at ₹999/month unless cancelled 48h prior."
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Return Policy Notice (Step >= 5) */}
                <AnimatePresence>
                  {currentStep >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-surface-highlight border border-borderMuted text-zinc-300 p-2.5 rounded-lg flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[11px]">
                        <span className="font-medium text-ivory">Return Clause:</span> 14-day window subject to 15% restocking fee (₹749) on opened items. Return shipping paid by buyer.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* True Cost Total (Step >= 6) */}
                {currentStep >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="pt-2 border-t border-borderMuted flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[10px] uppercase font-mono text-zinc-400">
                        Calculated True Cost
                      </div>
                      <div className="text-lg font-bold text-lime font-mono">₹6,047.82</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-zinc-400">Future Recurring</div>
                      <div className="text-xs font-semibold text-red-400 font-mono">₹999/month</div>
                    </div>
                  </motion.div>
                )}

                {/* Final Recommendation & Rule Evaluation (Step >= 7) */}
                {currentStep >= 7 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 rounded-lg bg-charcoal border border-amber-500/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold text-ivory uppercase tracking-wide">
                          Conditional Checkout: REVIEW
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Violates user rule "Disallow automatic renewals"
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold font-mono">
                      HOLD
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
