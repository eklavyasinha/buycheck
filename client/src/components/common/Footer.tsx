import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-borderMuted bg-surface/80 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-charcoal border border-lime/30 flex items-center justify-center text-lime">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-ivory">
              Buy<span className="text-lime">Check</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            AI-powered shopping intelligence & payment protection. Uncovering hidden charges, recurring traps, and deceptive checkout patterns before payment.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ivory uppercase tracking-wider mb-3">Product</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li><Link to="/analyze" className="hover:text-lime transition-colors">Purchase Analysis</Link></li>
            <li><Link to="/rules" className="hover:text-lime transition-colors">Purchase Rules Engine</Link></li>
            <li><Link to="/transactions" className="hover:text-lime transition-colors">Sandbox Checkout</Link></li>
            <li><a href="#how-it-works" className="hover:text-lime transition-colors">How It Works</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ivory uppercase tracking-wider mb-3">Consumer Protection</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li><span className="text-zinc-500">True Cost Calculation</span></li>
            <li><span className="text-zinc-500">Dark Pattern Detection</span></li>
            <li><span className="text-zinc-500">Subscription Traps Intel</span></li>
            <li><a href="https://www.paypal.com/webapps/mpp/paypal-safety-and-security" target="_blank" rel="noopener noreferrer" className="hover:text-lime inline-flex items-center gap-1 transition-colors">PayPal Purchase Protection Policy <ExternalLink className="w-3 h-3" /></a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ivory uppercase tracking-wider mb-3">Transparency & Disclaimers</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            BuyCheck provides AI-assisted shopping reports based strictly on submitted public text, screenshots, or URLs. Merchant return policies and PayPal Purchase Protection are separate. Actual PayPal eligibility is determined exclusively by PayPal under its applicable agreements.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-borderSubtle flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
        <p>© 2026 BuyCheck Platform. Built for consumer transparency & payment confidence.</p>
        <p className="flex items-center gap-1">
          Shop smarter. Pay with confidence.
        </p>
      </div>
    </footer>
  );
};
