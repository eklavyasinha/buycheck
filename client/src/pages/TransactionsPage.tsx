import React, { useState, useEffect } from 'react';
import { DashboardAPI } from '../services/api.js';
import { TransactionRecord } from '../types/analysis.js';
import { CreditCard, CheckCircle2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTx() {
      try {
        setLoading(true);
        const data = await DashboardAPI.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.warn('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTx();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-borderMuted">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-lime/10 text-lime border border-lime/20 mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          PayPal Sandbox Payment Records
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
          Verified Transactions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Cryptographically recorded Sandbox checkouts authorized through BuyCheck’s conditional protection engine.
        </p>
      </div>

      {/* Sandbox Notice Banner */}
      <div className="p-4 rounded-xl bg-charcoal border border-borderMuted text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-lime shrink-0" />
          <span>
            <strong className="text-ivory">Sandbox Environment Notice:</strong> All transactions listed below were executed in the official PayPal Sandbox or Developer Simulation test mode. No real money or payment method was debited.
          </span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card rounded-2xl border border-borderMuted overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 animate-spin text-lime" />
            <span>Loading Sandbox Transaction Ledger...</span>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-borderMuted">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">PayPal Order ID</th>
                  <th className="px-5 py-3.5">Capture Reference</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle text-zinc-300 font-sans">
                {transactions.map((tx) => (
                  <tr key={tx._id || tx.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-ivory">
                      {tx.productName}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-lime">
                      {tx.currency} {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-400">
                      {tx.paypalOrderId}
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-500">
                      {tx.paypalCaptureId || 'CAP-VERIFIED'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <CreditCard className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="text-sm font-semibold text-ivory">No Sandbox Transactions Found</div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Analyze a purchase and proceed through conditional checkout to test the PayPal Sandbox integration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
