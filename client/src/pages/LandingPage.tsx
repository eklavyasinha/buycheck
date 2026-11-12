import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.js';
import { InteractivePreview } from '../components/landing/InteractivePreview.js';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  ArrowRight,
  Sparkles,
  Bot,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How does BuyCheck find hidden fees that merchants omit?',
    a: 'BuyCheck inspects public product pages, fine print, Terms of Service excerpts, and checkout screenshots. Using Gemini AI, it identifies undeclared taxes, mandatory handling surcharges, return shipping conditions, and restocking deductions that are obscured during initial browsing.',
  },
  {
    q: 'Does BuyCheck automatically authorize payments on its own?',
    a: 'No. BuyCheck follows the strict principle that AI must never independently authorize payments. A deterministic backend rule engine evaluates merchant terms against your explicit personal rules, and requires your affirmative confirmation before initializing PayPal Sandbox checkout.',
  },
  {
    q: 'How does BuyCheck evaluate PayPal Purchase Protection eligibility?',
    a: 'BuyCheck analyzes transaction factors such as item type (tangible vs intangible), billing model (one-time vs automatic preapproved recurring agreements), and exclusions against official PayPal User Agreement guidelines to help you understand potential claim factors.',
  },
  {
    q: 'Can I test BuyCheck without configuring API keys or signing up?',
    a: 'Yes! Click "Guest Demo Mode" to explore the platform with pre-configured demonstration analyses, realistic sample datasets, and full conditional checkout testing.',
  },
  {
    q: 'What happens if a product violates one of my personal rules?',
    a: 'The conditional checkout engine marks the transaction as BLOCKED and details the exact violation (for example: confirmed price exceeds your limit or merchant mandates an auto-renewal subscription). The payment flow will refuse to initiate until conditions are satisfied.',
  },
];

export const LandingPage: React.FC = () => {
  const { startGuestMode } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGuestClick = async () => {
    await startGuestMode();
    navigate('/dashboard');
  };

  return (
    <div className="w-full space-y-24 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-lime/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-surface-elevated border border-borderMuted text-lime shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            <span>AI Shopping Intelligence & Payment Protection</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ivory tracking-tight leading-[1.08]">
            Know the <span className="text-lime">real cost</span> before you buy.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Uncover hidden charges, automatic trial conversions, restocking deductions, and deceptive checkout patterns before submitting payment.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/analyze"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-graphite font-bold text-sm tracking-wide shadow-lg lime-glow-subtle transition-all tactile-btn"
            >
              <span>Analyze a Purchase</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleGuestClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface border border-borderMuted hover:border-lime/40 text-ivory font-semibold text-sm transition-all tactile-btn"
            >
              <Sparkles className="w-4 h-4 text-lime" />
              <span>Explore Guest Demo</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime" />
              <span>Evidence Before Warnings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime" />
              <span>Deterministic Checkout Guard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime" />
              <span>PayPal Sandbox Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section className="relative px-4">
        <InteractivePreview />
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-lime font-semibold">
            Comprehensive Intelligence Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ivory tracking-tight">
            Designed to Protect Your Wallet
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Every feature is built on verification, mathematical determinism, and zero AI guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-ivory">True Cost Calculator</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculates mathematically confirmed taxes, delivery fees, and surcharges. Clear separation between confirmed costs and conditional fees.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-ivory">Dark Pattern Detector</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Identifies pre-checked checkboxes, misleading free trial timers, and hidden recurring debits with verbatim merchant evidence quotes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-ivory">Subscription Intelligence</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Highlights automatic trial-to-paid conversions, renewal amounts, cancellation notice windows, and penalty fees.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-ivory">Purchase Rules Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Define personal rules in natural language or structured limits. Set maximum prices, return windows, and subscription bans.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-[#0070BA]/30 flex items-center justify-center text-[#0070BA]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-ivory">Conditional PayPal Checkout</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deterministic authorization that locks the payment amount to verified conditions and executes via official PayPal Sandbox.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-ivory">Contextual AI Assistant</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ask questions directly within your purchase report. The assistant answers using only verified merchant terms and disclaims unstated details.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-lime font-semibold">
            Simple 3-Step Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ivory tracking-tight">
            How BuyCheck Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-borderMuted space-y-3 relative">
            <span className="text-4xl font-black text-lime/30 font-mono">01</span>
            <h4 className="text-lg font-bold text-ivory">Submit Purchase Data</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter any product URL, upload a checkout screenshot, or paste terms. BuyCheck validates safety boundaries and extracts public pricing clauses.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-borderMuted space-y-3 relative">
            <span className="text-4xl font-black text-lime/30 font-mono">02</span>
            <h4 className="text-lg font-bold text-ivory">AI Evidence Extraction</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gemini AI models audit terms to uncover unexpected fees, dark patterns, and restocking clauses—calculating the True Cost.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-borderMuted space-y-3 relative">
            <span className="text-4xl font-black text-lime/30 font-mono">03</span>
            <h4 className="text-lg font-bold text-ivory">Protected Checkout</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our deterministic rule engine confirms all your conditions. Review warnings and proceed with a server-verified PayPal Sandbox order.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Philosophy Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-borderMuted space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
            Our Core Consumer Philosophy
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            We believe that consumers deserve total transparency before transactions. Unknown information must remain unknown. We never invent merchant policies, never fabricate charges, and never let AI authorize payments without explicit user command.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Everything you need to know about BuyCheck's intelligence and protection model.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-xl border border-borderMuted overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-ivory hover:text-lime transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-lime' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-zinc-400 leading-relaxed border-t border-borderSubtle pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-lime/30 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-3xl sm:text-4xl font-extrabold text-ivory tracking-tight">
            Stop Guessing. Shop With Total Confidence.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Analyze your first purchase URL or screenshot in seconds and verify every hidden cost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/analyze"
              className="px-8 py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-graphite font-bold text-xs tracking-wide shadow-lg tactile-btn"
            >
              Start Free Purchase Audit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
