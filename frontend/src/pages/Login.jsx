import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { GlassCard } from '../components/GlassCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { Sprout } from '../components/icons.jsx';

export function Login() {
  const { token, loading, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Restoring session…" />
      </div>
    );
  }

  if (token) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-field-radial px-4 py-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-700/35">
            <Sprout className="h-9 w-9 text-white" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-slate-900 dark:text-white">
            Sign in to your farm
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Secure JWT session · bcrypt hashed passwords · ML predictions on demand
          </p>
        </div>

        <GlassCard>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Need an account?{' '}
            <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300" to="/register">
              Create one
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
