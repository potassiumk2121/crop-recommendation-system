import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { GlassCard } from '../components/GlassCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { Sprout } from '../components/icons.jsx';

export function Register() {
  const { token, loading, login } = useAuth();
  const [name, setName] = useState('');
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
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      login(data.token, data.user);
      toast.success('Account created · welcome aboard!');
    } catch (err) {
      const errors = err.response?.data?.errors;
      const first = Array.isArray(errors) ? errors[0]?.msg : null;
      toast.error(first || err.message || 'Registration failed');
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
            Create your grower profile
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Track recommendations, visualize trends, and keep audit-friendly history.
          </p>
        </div>

        <GlassCard>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full name
              </label>
              <input
                className="glass-input"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                className="glass-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@farm.co"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                className="glass-input"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300" to="/login">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
