import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DashboardAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Compass,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isGuest } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await DashboardAPI.getSummary();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Clock className="w-8 h-8 animate-spin text-lime mb-3" />
        <h3 className="text-base font-bold text-ivory">Loading Dashboard Metrics...</h3>
      </div>
    );
  }

  const summary = data?.summary || {
    totalAnalyses: 0,
    totalTrapsDetected: 0,
    activeRulesCount: 0,
    completedTransactionsCount: 0,
    riskDistribution: [],
  };

  const recentAnalyses = data?.recentAnalyses || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderMuted">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
              Shopping Intelligence Dashboard
            </h1>
            {isGuest && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-lime/10 text-lime border border-lime/20">
                Guest Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Welcome back, {user?.name || 'Shopper'}. Real-time monitoring of merchant pricing transparency and rules.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-graphite font-bold text-xs shadow-md transition-all tactile-btn self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-borderMuted space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Purchases Audited</span>
            <Compass className="w-4 h-4 text-lime" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ivory font-mono">
            {summary.totalAnalyses}
          </div>
          <p className="text-[11px] text-zinc-500">URLs, images & text evaluated</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-borderMuted space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Traps & Hidden Fees Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {summary.totalTrapsDetected}
          </div>
          <p className="text-[11px] text-zinc-500">Subscriptions, surcharges & fees</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-borderMuted space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Purchase Rules</span>
            <SlidersHorizontal className="w-4 h-4 text-lime" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ivory font-mono">
            {summary.activeRulesCount}
          </div>
          <p className="text-[11px] text-zinc-500">Guarding checkout authorization</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-borderMuted space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>PayPal Sandbox Orders</span>
            <CreditCard className="w-4 h-4 text-[#0070BA]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ivory font-mono">
            {summary.completedTransactionsCount}
          </div>
          <p className="text-[11px] text-zinc-500">Server verified transactions</p>
        </div>
      </div>

      {/* Grid: Risk Distribution + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Risk Breakdown */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <h3 className="text-sm font-bold text-ivory uppercase tracking-wider font-mono">
              Risk Profile Distribution
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Audited Items</span>
          </div>

          {summary.riskDistribution && summary.riskDistribution.length > 0 ? (
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.riskDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {summary.riskDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-charcoal border border-borderMuted p-2 rounded text-xs text-ivory font-mono">
                            {item.name}: {item.value} purchase(s)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-500">
              No analyses recorded yet.
            </div>
          )}

          <div className="flex justify-around text-xs border-t border-borderSubtle pt-3">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-lime" />
              Low Risk
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              Medium Risk
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              High Risk
            </span>
          </div>
        </div>

        {/* Right: Activity Stream */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <h3 className="text-sm font-bold text-ivory uppercase tracking-wider font-mono">
              Activity Stream
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Audit Log</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-borderSubtle text-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                    <div>
                      <div className="text-ivory font-medium">{act.description}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {act.type}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-zinc-500">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Analyses List */}
      <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
          <div>
            <h3 className="text-base font-bold text-ivory tracking-tight">
              Recent Purchase Reports
            </h3>
            <p className="text-xs text-zinc-400">
              Detailed breakdown of recent audits, pricing revelations, and recommendations.
            </p>
          </div>
          <Link
            to="/analyze"
            className="text-xs text-lime hover:underline font-mono"
          >
            + Analyze Another
          </Link>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="divide-y divide-borderSubtle">
            {recentAnalyses.map((item: any, idx: number) => {
              const risk = item.overallRiskLevel || 'medium';
              return (
                <div
                  key={idx}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/40 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ivory">
                        {item.productName || 'Analyzed Product'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          risk === 'low'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : risk === 'high'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {risk} risk
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-3">
                      <span>Advertised: {item.currency} {item.advertisedPrice}</span>
                      <span>•</span>
                      <span>Type: {item.inputType}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    to={`/report/${item._id || item.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-lime/40 text-xs text-zinc-200 hover:text-ivory font-medium transition-all self-start sm:self-auto"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Compass className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">No purchase reports found.</p>
            <Link
              to="/analyze"
              className="inline-block px-4 py-2 rounded-xl bg-lime text-graphite text-xs font-bold"
            >
              Start Your First Purchase Audit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
