import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisAPI } from '../services/api.js';
import { StructuredAnalysis, TransactionRecord } from '../types/analysis.js';
import { TrueCostCard } from '../components/report/TrueCostCard.js';
import { DarkPatternCard } from '../components/report/DarkPatternCard.js';
import { SubscriptionIntelCard } from '../components/report/SubscriptionIntelCard.js';
import { PolicyCard } from '../components/report/PolicyCard.js';
import { PayPalProtectionCard } from '../components/report/PayPalProtectionCard.js';
import { AssistantWidget } from '../components/report/AssistantWidget.js';
import { ConditionalCheckoutModal } from '../components/checkout/ConditionalCheckoutModal.js';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Share2,
  Trash2,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<StructuredAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await AnalysisAPI.getById(id);
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'Report not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this purchase report?')) return;
    try {
      await AnalysisAPI.delete(id);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  const handleCopySummary = () => {
    if (!analysis) return;
    const text = `BuyCheck Purchase Report: ${analysis.productName}
Advertised Price: ${analysis.currency} ${analysis.advertisedPrice}
True Confirmed Total: ${analysis.currency} ${analysis.trueCost?.confirmedTotal || analysis.advertisedPrice}
Risk Level: ${analysis.overallRiskLevel.toUpperCase()}
Recommendation: ${analysis.recommendation.toUpperCase()}
Dark Patterns Detected: ${analysis.darkPatterns.length}
Summary: ${analysis.summary}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Clock className="w-10 h-10 animate-spin text-lime mb-4" />
        <h2 className="text-xl font-bold text-ivory">Loading Purchase Intelligence...</h2>
        <p className="text-xs text-zinc-400 mt-1">Retrieving verified evidence and calculations.</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ivory">Report Unavailable</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">{error || 'This report does not exist or has been deleted.'}</p>
        <Link
          to="/analyze"
          className="mt-6 px-4 py-2 rounded-xl bg-lime text-graphite text-xs font-bold"
        >
          Analyze a New Purchase
        </Link>
      </div>
    );
  }

  const rec = analysis.recommendation || 'review';
  const risk = analysis.overallRiskLevel || 'medium';

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-lime transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-lime/40 text-xs text-zinc-300 hover:text-ivory transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Share Summary'}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-red-400/40 text-xs text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Demo Analysis Warning Banner (if demo data) */}
      {analysis.metadata?.isDemoAnalysis && (
        <div className="p-3.5 rounded-xl bg-charcoal border border-lime/30 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="w-4 h-4 text-lime shrink-0" />
            <span>
              <strong className="text-lime">Demonstration Analysis:</strong> {analysis.metadata.limitations?.[0] || 'Showcasing full BuyCheck intelligence engine.'}
            </span>
          </div>
          <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-lime/10 text-lime border border-lime/20">
            Demo Intelligence
          </span>
        </div>
      )}

      {/* Main Title & Hero Recommendation Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-borderMuted space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  risk === 'low'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : risk === 'high'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {risk} Risk Level
              </span>

              <span className="text-xs text-zinc-500 font-mono">
                Source: {analysis.metadata?.sourceType || 'Web Input'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
              {analysis.productName || 'Purchase Analysis Report'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {analysis.summary}
            </p>
          </div>

          {/* Recommendation Action Pill */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div
              className={`p-4 rounded-xl border text-center min-w-[200px] ${
                rec === 'buy'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : rec === 'avoid'
                  ? 'bg-red-500/10 border-red-500/40 text-red-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                AI Recommendation
              </div>
              <div className="text-2xl font-black tracking-tight mt-0.5 uppercase">
                {rec === 'buy' ? 'Proceed with Care' : rec === 'avoid' ? 'Avoid Purchase' : 'Review Closely'}
              </div>
            </div>

            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lime hover:bg-lime-hover text-graphite font-bold text-xs tracking-wide shadow-md transition-all tactile-btn"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Protected Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: True Cost Breakdown & Dark Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <TrueCostCard
            trueCost={analysis.trueCost}
            currency={analysis.currency}
            advertisedPrice={analysis.advertisedPrice}
          />
        </div>

        <div className="lg:col-span-12">
          <DarkPatternCard darkPatterns={analysis.darkPatterns} />
        </div>

        <div className="lg:col-span-6">
          <SubscriptionIntelCard
            recurringCharges={analysis.recurringCharges}
            cancellationPolicy={analysis.cancellationPolicy}
            currency={analysis.currency}
          />
        </div>

        <div className="lg:col-span-6">
          <PolicyCard
            returnPolicy={analysis.returnPolicy}
            missingInformation={analysis.missingInformation}
            currency={analysis.currency}
          />
        </div>

        <div className="lg:col-span-12">
          <PayPalProtectionCard analysisId={analysis._id || analysis.id || 'sample-analysis-headphones'} />
        </div>

        <div className="lg:col-span-12">
          <AssistantWidget analysis={analysis} />
        </div>
      </div>

      {/* Conditional Checkout Modal */}
      {showCheckoutModal && (
        <ConditionalCheckoutModal
          analysis={analysis}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={(tx: TransactionRecord) => {
            // Keep modal open on success screen so user sees verified receipt
          }}
        />
      )}
    </div>
  );
};
