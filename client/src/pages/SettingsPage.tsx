import React, { useState, useEffect } from 'react';
import { DashboardAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  User,
  Moon,
  Sun,
  ShieldCheck,
  Server,
  Key,
  LogOut,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isGuest, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await DashboardAPI.getSettings();
        setSettingsData(data);
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const integrations = settingsData?.integrations || {
    gemini: { configured: false, model: 'gemini-3.8-flash', status: 'Checking...' },
    paypal: { configured: false, mode: 'sandbox', status: 'Checking...' },
    database: { type: 'Local Persistence', status: 'Active' },
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-borderMuted">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
          Settings & Environment Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your profile, visual theme, and inspect active backend service connections.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
        <h3 className="text-base font-bold text-ivory flex items-center gap-2">
          <User className="w-4 h-4 text-lime" />
          User Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
            <span className="text-zinc-500 block mb-0.5">Full Name</span>
            <span className="text-sm font-semibold text-ivory">{user?.name || 'Guest Explorer'}</span>
          </div>

          <div className="bg-surface p-3.5 rounded-xl border border-borderMuted">
            <span className="text-zinc-500 block mb-0.5">Email Address</span>
            <span className="text-sm font-mono text-ivory">{user?.email || 'guest@buycheck.local'}</span>
          </div>
        </div>

        {isGuest && (
          <div className="p-3 rounded-lg bg-lime/10 border border-lime/20 text-lime text-xs">
            You are operating in <strong>Guest Demo Mode</strong>. Data is kept within your local browser session.
          </div>
        )}
      </div>

      {/* Appearance Card */}
      <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
        <h3 className="text-base font-bold text-ivory flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-lime" /> : <Sun className="w-4 h-4 text-amber-400" />}
          Visual Appearance
        </h3>
        <p className="text-xs text-zinc-400">
          Toggle between dark luxury theme and high-contrast light mode.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-borderMuted hover:border-lime/40 text-xs font-semibold text-ivory transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Switch to Luxury Dark Theme</span>
              </>
            )}
          </button>
          <span className="text-xs font-mono text-zinc-500">Currently: {theme}</span>
        </div>
      </div>

      {/* Backend Integration Diagnostics Card */}
      <div className="glass-card rounded-2xl p-6 border border-borderMuted space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ivory flex items-center gap-2">
            <Server className="w-4 h-4 text-lime" />
            Backend Service Status
          </h3>
          <span className="text-xs font-mono text-zinc-400">Environment Verification</span>
        </div>

        <div className="space-y-3">
          {/* Gemini */}
          <div className="p-3.5 rounded-xl bg-surface border border-borderSubtle flex items-start justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-ivory flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-lime" />
                Google Gemini API
              </div>
              <p className="text-zinc-400 text-[11px]">{integrations.gemini.status}</p>
              <div className="text-[10px] font-mono text-zinc-500">Model: {integrations.gemini.model}</div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                integrations.gemini.configured
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {integrations.gemini.configured ? 'Configured' : 'Demo Mode'}
            </span>
          </div>

          {/* PayPal */}
          <div className="p-3.5 rounded-xl bg-surface border border-borderSubtle flex items-start justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-ivory flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0070BA]" />
                PayPal Developer Sandbox
              </div>
              <p className="text-zinc-400 text-[11px]">{integrations.paypal.status}</p>
              <div className="text-[10px] font-mono text-zinc-500">Mode: {integrations.paypal.mode}</div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                integrations.paypal.configured
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {integrations.paypal.configured ? 'Active' : 'Simulation'}
            </span>
          </div>

          {/* Database */}
          <div className="p-3.5 rounded-xl bg-surface border border-borderSubtle flex items-start justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-ivory flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-lime" />
                Storage Architecture
              </div>
              <p className="text-zinc-400 text-[11px]">Database Type: {integrations.database.type}</p>
              <div className="text-[10px] font-mono text-zinc-500">Status: {integrations.database.status}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Log out */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Session</span>
        </button>
      </div>
    </div>
  );
};
