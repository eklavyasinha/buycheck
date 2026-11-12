import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AuthAPI } from '../services/api.js';
import { ShieldCheck, Sparkles, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, startGuestMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await AuthAPI.login({ email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestExplore = async () => {
    await startGuestMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
            Sign In to Buy<span className="text-lime">Check</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Access your verified purchase reports, rules, and protected checkouts.
          </p>
        </div>

        {/* Guest Demo Mode Quick Action */}
        <div className="glass-card rounded-2xl p-4 border border-lime/30 text-center space-y-2">
          <div className="text-xs text-zinc-300">
            Evaluating as a judge or exploring the platform?
          </div>
          <button
            onClick={handleGuestExplore}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-lime/10 hover:bg-lime/20 border border-lime/40 text-lime font-bold text-xs transition-colors tactile-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>Instant Guest Demo Mode (No Sign Up Needed)</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-borderMuted" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-graphite text-zinc-500 font-mono">Or with credentials</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-borderMuted space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="consumer@example.com"
                  className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-lime"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-lime"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-lime hover:bg-lime-hover disabled:opacity-50 text-graphite font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 tactile-btn mt-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-zinc-400 pt-2 border-t border-borderSubtle">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-lime font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
