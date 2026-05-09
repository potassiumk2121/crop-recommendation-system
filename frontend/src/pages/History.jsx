import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { api } from '../api/client.js';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function History() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.trim()), 380);
    return () => clearTimeout(t);
  }, [query]);

  const params = useMemo(() => {
    const p = { limit: 100 };
    if (debouncedSearch) p.search = debouncedSearch;
    if (cropFilter.trim()) p.crop = cropFilter.trim();
    if (from) p.from = new Date(`${from}T00:00:00`).toISOString();
    if (to) p.to = new Date(`${to}T23:59:59`).toISOString();
    return p;
  }, [debouncedSearch, cropFilter, from, to]);

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      setLoading(true);
      try {
        const { data } = await api.get('/predictions', { params });
        if (!cancelled) {
          setItems(data.predictions || []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        toast.error(err.message || 'Could not fetch history');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOnce();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const clearFilters = () => {
    setQuery('');
    setCropFilter('');
    setFrom('');
    setTo('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Prediction history
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Atlas-backed ledger with JWT-scoped isolation · filter by crop, date span, fuzzy label match
        </p>
      </div>

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm xl:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              Search crops
            </span>
            <input
              className="glass-input mt-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., rice · cotton · grapes"
            />
          </label>
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              Exact-ish filter
            </span>
            <input
              className="glass-input mt-2"
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              placeholder="crop label"
            />
          </label>
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              From
            </span>
            <input type="date" className="glass-input mt-2" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              To
            </span>
            <input type="date" className="glass-input mt-2" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span>
            Showing {items.length} / {total} visible rows · debounced typing for smoother UX
          </span>
          <button type="button" className="btn-ghost py-1 text-[11px] uppercase tracking-wide" onClick={clearFilters}>
            Reset filters
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <LoadingSpinner label="Hydrating Atlas slice…" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-slate-600 dark:text-slate-400">No matching predictions yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/30 dark:border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/70 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">N-P-K</th>
                  <th className="px-4 py-3">Climate</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 dark:divide-white/5">
                {items.map((row) => (
                  <tr key={row._id} className="bg-white/30 hover:bg-white/60 dark:bg-slate-900/30 dark:hover:bg-slate-800/60">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold capitalize text-emerald-800 dark:text-emerald-300">
                      {row.predictedCrop}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      N {row.inputs.N} · P {row.inputs.P} · K {row.inputs.K}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {Number(row.inputs.temperature).toFixed(1)}°C · {Number(row.inputs.humidity).toFixed(0)}%
                      RH · pH {Number(row.inputs.ph).toFixed(1)} · {Number(row.inputs.rainfall).toFixed(1)} mm
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-100">
                      {typeof row.confidence === 'number' ? `${(row.confidence * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
