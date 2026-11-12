import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckoutAPI,
  PayPalAPI,
} from '../../services/api.js';
import {
  StructuredAnalysis,
  CheckoutEvaluation,
  TransactionRecord,
} from '../../types/analysis.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Lock,
  ArrowRight,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';

interface ConditionalCheckoutModalProps {
  analysis: StructuredAnalysis;
  onClose: () => void;
  onSuccess: (tx: TransactionRecord) => void;
}

export const ConditionalCheckoutModal: React.FC<ConditionalCheckoutModalProps> = ({
  analysis,
  onClose,
  onSuccess,
}) => {
  const analysisId = analysis._id || analysis.id || 'sample-analysis-headphones';

  const [step, setStep] = useState<'EVALUATING' | 'REVIEW' | 'PAYPAL' | 'PROCESSING' | 'SUCCESS'>('EVALUATING');
  const [evaluation, setEvaluation] = useState<CheckoutEvaluation | null>(null);
  const [activeRulesCount, setActiveRulesCount] = useState<number>(0);
  const [acknowledgedRisks, setAcknowledgedRisks] = useState<string[]>([]);
  const [approvalToken, setApprovalToken] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [isDemoSimulation, setIsDemoSimulation] = useState<boolean>(true);
  const [completedTx, setCompletedTx] = useState<TransactionRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Run deterministic checkout evaluation
  useEffect(() => {
    async function runEval() {
      try {
        setErrorMessage(null);
        const data = await CheckoutAPI.evaluate(analysisId);
        setEvaluation(data.evaluation);
        setActiveRulesCount(data.activeRulesCount);
        setStep('REVIEW');
      } catch (err: any) {
        setErrorMessage(err.message || 'Evaluation failed.');
      }
    }
    runEval();
  }, [analysisId]);

  const toggleAcknowledge = (item: string) => {
    setAcknowledgedRisks((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Step 2: User explicitly authorizes purchase
  const handleUserApprove = async () => {
    if (!evaluation) return;
    setErrorMessage(null);

    // If warnings exist, ensure all are acknowledged
    if (
      evaluation.requiresUserAcknowledgement &&
      acknowledgedRisks.length < evaluation.acknowledgementItems.length
    ) {
      setErrorMessage('Please review and check each risk acknowledgement item before approving payment.');
      return;
    }

    try {
      const approveRes = await CheckoutAPI.approve({
        analysisId,
        maxAuthorizedAmount: evaluation.maxAuthorizedAmount,
        currency: evaluation.currency,
        acknowledgedRisks,
      });

      setApprovalToken(approveRes.approvalToken);

      // Create PayPal order
      const orderRes = await PayPalAPI.createOrder(approveRes.approvalToken);
      setPaypalOrderId(orderRes.orderId);
      setIsDemoSimulation(Boolean(orderRes.isDemoSimulation));
      setStep('PAYPAL');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve checkout.');
    }
  };

  // Step 3: Capture and verify payment server-side
  const handleExecutePayment = async () => {
    if (!paypalOrderId || !approvalToken) return;

    setStep('PROCESSING');
    setErrorMessage(null);

    try {
      const captureRes = await PayPalAPI.captureOrder(paypalOrderId, approvalToken);
      setCompletedTx(captureRes.transaction);
      setStep('SUCCESS');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4FF00', '#FFFFFF', '#60A5FA'],
      });

      onSuccess(captureRes.transaction);
    } catch (err: any) {
      setErrorMessage(err.message || 'Server payment capture failed.');
      setStep('PAYPAL');
    }
  };

  const confirmedTotal = analysis.trueCost?.confirmedTotal || analysis.advertisedPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-graphite border border-borderMuted rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderMuted bg-charcoal">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime" />
            <span className="font-bold text-sm text-ivory">
              Conditional Payment Protection
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-ivory transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* STEP: EVALUATING */}
          {step === 'EVALUATING' && (
            <div className="py-12 text-center space-y-3">
              <Clock className="w-10 h-10 animate-spin text-lime mx-auto" />
              <h4 className="text-base font-bold text-ivory">
                Evaluating Rules & Merchant Terms...
              </h4>
              <p className="text-xs text-zinc-400">
                Determining if purchase meets all mandatory user rules.
              </p>
            </div>
          )}

          {/* STEP: REVIEW & APPROVAL */}
          {step === 'REVIEW' && evaluation && (
            <div className="space-y-4">
              {/* Decision Badge */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  evaluation.decision === 'APPROVED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : evaluation.decision === 'BLOCKED'
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {evaluation.decision === 'APPROVED' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : evaluation.decision === 'BLOCKED' ? (
                  <XCircle className="w-5 h-5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                )}
                <div>
                  <div className="text-xs font-mono font-bold tracking-wider uppercase">
                    Checkout Decision: {evaluation.decision}
                  </div>
                  <div className="text-xs mt-0.5 leading-relaxed">
                    {evaluation.overallReason}
                  </div>
                </div>
              </div>

              {/* Purchase Details Bar */}
              <div className="bg-surface p-3.5 rounded-xl border border-borderMuted flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Product:</span>{' '}
                  <span className="font-semibold text-ivory">{analysis.productName}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Locked Total:</span>{' '}
                  <span className="font-mono font-bold text-lime">
                    {evaluation.currency} {evaluation.maxAuthorizedAmount}
                  </span>
                </div>
              </div>

              {/* Rule Checklist */}
              <div>
                <h5 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Condition Verification ({activeRulesCount} active rule sets)
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {evaluation.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface border border-borderSubtle flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-medium text-ivory">{check.ruleName}</div>
                        <div className="text-[11px] text-zinc-400">
                          {check.evidenceOrReason}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          check.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : check.status === 'FAILED'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required User Acknowledgements (if any) */}
              {evaluation.requiresUserAcknowledgement && (
                <div className="p-3 rounded-xl bg-charcoal border border-borderMuted space-y-2">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Required Confirmation Before Payment
                  </span>
                  <div className="space-y-2">
                    {evaluation.acknowledgementItems.map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={acknowledgedRisks.includes(item)}
                          onChange={() => toggleAcknowledge(item)}
                          className="mt-0.5 rounded bg-graphite border-borderMuted text-lime focus:ring-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-surface border border-borderMuted text-xs font-medium text-zinc-300 hover:text-ivory"
                >
                  Cancel
                </button>
                {evaluation.decision === 'BLOCKED' ? (
                  <button
                    disabled
                    className="px-5 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold cursor-not-allowed"
                  >
                    Payment Blocked By Rule
                  </button>
                ) : (
                  <button
                    onClick={handleUserApprove}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-lime hover:bg-lime-hover text-graphite font-bold text-xs shadow tactile-btn"
                  >
                    <span>Approve & Proceed to PayPal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP: PAYPAL SANDBOX BUTTON & CHECKOUT */}
          {step === 'PAYPAL' && (
            <div className="space-y-4">
              <div className="bg-surface p-4 rounded-xl border border-borderMuted text-xs space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Merchant Item:</span>
                  <span className="text-ivory font-medium">{analysis.productName}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Max Authorized Total:</span>
                  <span className="font-mono font-bold text-lime text-sm">
                    {evaluation?.currency} {evaluation?.maxAuthorizedAmount}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>PayPal Order Reference:</span>
                  <span className="font-mono text-zinc-300">{paypalOrderId}</span>
                </div>
              </div>

              {isDemoSimulation && (
                <div className="p-3 rounded-lg bg-lime/10 border border-lime/20 text-lime text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PayPal Developer Sandbox Simulation Active
                  </div>
                  <div className="text-zinc-300 text-[11px] leading-relaxed">
                    Test payment authorization flow initialized with server-side validation. No real currency is transferred.
                  </div>
                </div>
              )}

              {/* PayPal Sandbox Action Box */}
              <div className="p-6 rounded-xl bg-charcoal border border-borderMuted text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-ivory font-bold text-base">
                  <CreditCard className="w-5 h-5 text-[#0070BA]" />
                  <span>PayPal Checkout Sandbox</span>
                </div>

                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  By clicking below, you authorize the server to capture payment up to the verified amount of{' '}
                  <span className="text-lime font-mono font-semibold">
                    {evaluation?.currency} {evaluation?.maxAuthorizedAmount}
                  </span>.
                </p>

                <button
                  onClick={handleExecutePayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 tactile-btn"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Pay with PayPal Sandbox</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: PROCESSING */}
          {step === 'PROCESSING' && (
            <div className="py-12 text-center space-y-3">
              <Clock className="w-10 h-10 animate-spin text-lime mx-auto" />
              <h4 className="text-base font-bold text-ivory">
                Capturing & Verifying PayPal Order...
              </h4>
              <p className="text-xs text-zinc-400">
                Server is verifying payment amount and recording transaction idempotently.
              </p>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'SUCCESS' && completedTx && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-ivory">
                  Payment Confirmed & Verified!
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  The transaction was captured and matched to your approved purchasing conditions.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-surface p-4 rounded-xl border border-borderMuted text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID:</span>
                  <span className="text-zinc-300">{completedTx.id || completedTx._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PayPal Order ID:</span>
                  <span className="text-zinc-300">{completedTx.paypalOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PayPal Capture ID:</span>
                  <span className="text-zinc-300">{completedTx.paypalCaptureId || 'CAP-VERIFIED'}</span>
                </div>
                <div className="flex justify-between border-t border-borderSubtle pt-2">
                  <span className="text-zinc-400">Amount Captured:</span>
                  <span className="text-lime font-bold">
                    {completedTx.currency} {completedTx.amount}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-lime hover:bg-lime-hover text-graphite font-bold text-xs transition-colors tactile-btn"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
