import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AuthAPI } from '../services/api.js';
import { ShieldCheck, ArrowRight, AlertCircle, User, Mail, Lock } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await AuthAPI.register({ name, email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal border border-lime/30 flex items-center justify-center text-lime mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-zinc-400">
            Join BuyCheck to protect your online purchases with AI transparency.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-borderMuted space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-lime"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-lime"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Password (min 6 characters)</label>
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
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-zinc-400 pt-2 border-t border-borderSubtle">
            Already have an account?{' '}
            <Link to="/login" className="text-lime font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
