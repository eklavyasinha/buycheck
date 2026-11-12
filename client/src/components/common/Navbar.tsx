import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import {
  ShieldCheck,
  Sun,
  Moon,
  Compass,
  SlidersHorizontal,
  CreditCard,
  LogOut,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isGuest, logout, startGuestMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-borderMuted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime group-hover:lime-glow transition-all">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-ivory flex items-center gap-1.5">
              Buy<span className="text-lime">Check</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono -mt-1 tracking-wider uppercase">
              Consumer Intel
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link to="/#features" className="hover:text-lime transition-colors">
            Features
          </Link>
          <Link to="/#how-it-works" className="hover:text-lime transition-colors">
            How It Works
          </Link>
          <Link to="/#interactive-preview" className="hover:text-lime transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            Live Preview
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-lime transition-colors">
                Dashboard
              </Link>
              <Link to="/analyze" className="hover:text-lime transition-colors flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                Analyze
              </Link>
              <Link to="/rules" className="hover:text-lime transition-colors flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Rules
              </Link>
              <Link to="/transactions" className="hover:text-lime transition-colors flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Sandbox Orders
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg bg-surface border border-borderMuted flex items-center justify-center text-zinc-300 hover:text-ivory hover:border-lime/40 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              {isGuest && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-lime/10 text-lime border border-lime/20">
                  Guest Mode
                </span>
              )}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-lime/30 text-xs text-ivory font-medium transition-all"
              >
                <User className="w-3.5 h-3.5 text-lime" />
                <span className="hidden sm:inline truncate max-w-[120px]">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg bg-surface border border-borderMuted hover:text-red-400 hover:border-red-400/30 text-zinc-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  startGuestMode();
                  navigate('/dashboard');
                }}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-borderMuted hover:border-lime/40 text-xs font-medium text-zinc-300 hover:text-ivory transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-lime" />
                Guest Demo
              </button>
              <Link
                to="/login"
                className="text-xs font-medium text-zinc-300 hover:text-ivory px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/analyze"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-lime hover:bg-lime-hover text-graphite font-semibold text-xs transition-all shadow-sm tactile-btn"
              >
                Analyze Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
