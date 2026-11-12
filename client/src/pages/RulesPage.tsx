import React, { useState, useEffect } from 'react';
import { RulesAPI } from '../services/api.js';
import { PurchaseRuleItem, PurchaseRuleConditions } from '../types/analysis.js';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Send,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<PurchaseRuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Rule Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [ruleName, setRuleName] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [minReturnDays, setMinReturnDays] = useState<string>('14');
  const [maxExtraCharges, setMaxExtraCharges] = useState<string>('500');
  const [allowSubscription, setAllowSubscription] = useState<boolean>(false);
  const [requireFreeReturnShipping, setRequireFreeReturnShipping] = useState<boolean>(true);
  const [disallowRestockingFee, setDisallowRestockingFee] = useState<boolean>(true);

  // Natural language parser state
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await RulesAPI.getAll();
      setRules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rules.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (rule: PurchaseRuleItem) => {
    const ruleId = rule._id || rule.id;
    if (!ruleId) return;

    try {
      const updated = await RulesAPI.update(ruleId, { enabled: !rule.enabled });
      setRules((prev) =>
        prev.map((r) => ((r._id || r.id) === ruleId ? { ...r, enabled: updated.enabled } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update rule');
    }
  };

  const handleDeleteRule = async (ruleId?: string) => {
    if (!ruleId || !window.confirm('Delete this purchase rule?')) return;
    try {
      await RulesAPI.delete(ruleId);
      setRules((prev) => prev.filter((r) => (r._id || r.id) !== ruleId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete rule');
    }
  };

  const handleInterpretNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim() || isInterpreting) return;
    setIsInterpreting(true);
    try {
      const parsed = await RulesAPI.interpret(naturalLanguageInput.trim());
      if (parsed.suggestedRuleName) setRuleName(parsed.suggestedRuleName);
      if (parsed.maxPrice) setMaxPrice(parsed.maxPrice.toString());
      if (parsed.currency) setCurrency(parsed.currency);
      if (parsed.minimumReturnWindowDays) setMinReturnDays(parsed.minimumReturnWindowDays.toString());
      if (parsed.maxExtraCharges) setMaxExtraCharges(parsed.maxExtraCharges.toString());
      if (typeof parsed.allowSubscription === 'boolean') setAllowSubscription(parsed.allowSubscription);
      if (typeof parsed.requireFreeReturnShipping === 'boolean') setRequireFreeReturnShipping(parsed.requireFreeReturnShipping);
      if (typeof parsed.disallowRestockingFee === 'boolean') setDisallowRestockingFee(parsed.disallowRestockingFee);
    } catch (err: any) {
      alert('Interpretation failed: ' + err.message);
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      alert('Please enter a rule name.');
      return;
    }

    const conditions: PurchaseRuleConditions = {
      currency,
      allowSubscription,
      requireFreeReturnShipping,
      disallowRestockingFee,
    };
    if (maxPrice) conditions.maxPrice = parseFloat(maxPrice);
    if (minReturnDays) conditions.minimumReturnWindowDays = parseInt(minReturnDays, 10);
    if (maxExtraCharges) conditions.maxExtraCharges = parseFloat(maxExtraCharges);

    try {
      const created = await RulesAPI.create({
        name: ruleName.trim(),
        conditions,
        enabled: true,
      });
      setRules((prev) => [created, ...prev]);
      setShowCreateModal(false);
      // Reset form
      setRuleName('');
      setMaxPrice('');
      setNaturalLanguageInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to save rule.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderMuted">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-lime/10 text-lime border border-lime/20 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Deterministic Policy Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
            Personal Purchasing Rules
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Define mandatory conditions. BuyCheck will deterministically block or flag checkouts that violate your parameters.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-graphite font-bold text-xs shadow-md transition-all tactile-btn self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">Loading purchase rules...</div>
        ) : rules.length > 0 ? (
          rules.map((rule) => {
            const ruleId = rule._id || rule.id;
            const c = rule.conditions || {};
            return (
              <div
                key={ruleId}
                className={`glass-card rounded-2xl p-6 border transition-all ${
                  rule.enabled ? 'border-borderMuted' : 'border-borderSubtle opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base text-ivory">{rule.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          rule.enabled
                            ? 'bg-lime/10 text-lime border border-lime/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {rule.enabled ? 'Active Guard' : 'Disabled'}
                      </span>
                    </div>

                    {/* Condition Badges */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {c.maxPrice && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-borderSubtle text-zinc-300">
                          Max Total: <strong className="text-ivory font-mono">{c.currency || 'INR'} {c.maxPrice}</strong>
                        </span>
                      )}
                      {c.maxExtraCharges !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-borderSubtle text-zinc-300">
                          Max Extra Fees: <strong className="text-ivory font-mono">{c.currency || 'INR'} {c.maxExtraCharges}</strong>
                        </span>
                      )}
                      {c.allowSubscription === false && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-borderSubtle text-red-300">
                          Block Automatic Subscriptions
                        </span>
                      )}
                      {c.minimumReturnWindowDays && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-borderSubtle text-zinc-300">
                          Min Return Window: <strong className="text-ivory">{c.minimumReturnWindowDays} Days</strong>
                        </span>
                      )}
                      {c.disallowRestockingFee && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-borderSubtle text-zinc-300">
                          No Restocking Fees Allowed
                        </span>
                      )}
                      {c.requireFreeReturnShipping && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-borderSubtle text-zinc-300">
                          Free Return Shipping Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className="p-1 text-zinc-400 hover:text-ivory transition-colors"
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6 text-lime" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(ruleId)}
                      className="p-2 rounded-lg bg-surface hover:text-red-400 text-zinc-500 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center space-y-3 border border-borderMuted">
            <SlidersHorizontal className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-ivory">No Purchase Rules Defined</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Create rules to prevent unexpected subscriptions, price creep, and unannounced restocking fees.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-lime text-graphite text-xs font-bold"
            >
              Add Your First Rule
            </button>
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-graphite border border-borderMuted rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-lime" />
                <h3 className="font-bold text-base text-ivory">Create Purchase Rule</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-ivory"
              >
                ✕
              </button>
            </div>

            {/* Natural Language Prompt Assistant */}
            <div className="p-4 rounded-xl bg-charcoal border border-borderMuted space-y-2">
              <span className="text-xs font-mono text-lime flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Natural Language Rule Interpreter
              </span>
              <p className="text-[11px] text-zinc-400">
                Type in plain language (e.g., "Must be under ₹30000, no recurring charges, with at least 14 days return"):
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="e.g. Price under ₹25,000, no subscriptions, free return shipping..."
                  className="flex-1 bg-graphite text-xs text-ivory rounded-lg border border-borderMuted px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleInterpretNaturalLanguage}
                  disabled={isInterpreting || !naturalLanguageInput.trim()}
                  className="px-3 py-2 rounded-lg bg-surface border border-lime/40 text-xs font-medium text-lime hover:bg-lime/10 disabled:opacity-50"
                >
                  {isInterpreting ? 'Parsing...' : 'Auto-Fill'}
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Strict Electronics Budget Shield"
                  className="w-full bg-surface text-ivory rounded-xl border border-borderMuted px-3.5 py-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Max Total Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 40000"
                    className="w-full bg-surface text-ivory rounded-xl border border-borderMuted px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e: any) => setCurrency(e.target.value)}
                    className="w-full bg-surface text-ivory rounded-xl border border-borderMuted px-3 py-2 text-xs"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Min Return Window (Days)</label>
                  <input
                    type="number"
                    value={minReturnDays}
                    onChange={(e) => setMinReturnDays(e.target.value)}
                    placeholder="14"
                    className="w-full bg-surface text-ivory rounded-xl border border-borderMuted px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Max Extra Fees Allowed</label>
                  <input
                    type="number"
                    value={maxExtraCharges}
                    onChange={(e) => setMaxExtraCharges(e.target.value)}
                    placeholder="500"
                    className="w-full bg-surface text-ivory rounded-xl border border-borderMuted px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!allowSubscription}
                    onChange={(e) => setAllowSubscription(!e.target.checked)}
                    className="rounded bg-surface border-borderMuted text-lime focus:ring-0"
                  />
                  <span>Block mandatory recurring subscriptions</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireFreeReturnShipping}
                    onChange={(e) => setRequireFreeReturnShipping(e.target.checked)}
                    className="rounded bg-surface border-borderMuted text-lime focus:ring-0"
                  />
                  <span>Require merchant-paid return shipping</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disallowRestockingFee}
                    onChange={(e) => setDisallowRestockingFee(e.target.checked)}
                    className="rounded bg-surface border-borderMuted text-lime focus:ring-0"
                  />
                  <span>Disallow restocking deduction fees</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-borderMuted">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-borderMuted text-zinc-300 hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime hover:bg-lime-hover text-graphite font-bold tactile-btn"
                >
                  Save Purchase Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
