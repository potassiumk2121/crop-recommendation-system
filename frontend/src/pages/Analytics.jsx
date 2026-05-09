import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { api } from '../api/client.js';
import { useTheme } from '../context/ThemeContext.jsx';

export function Analytics() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const dark = theme === 'dark';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/analytics/summary', { params: { days: 30 } });
        if (!cancelled) setPayload(res.data);
      } catch (err) {
        toast.error(err.message || 'Analytics unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <LoadingSpinner label="Mining insights…" />
      </div>
    );
  }

  const paletteText = dark ? '#e2e8f0' : '#0f172a';
  const gridColor = dark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.35)';

  const top = payload?.charts?.mostRecommendedCrops?.slice(0, 10) ?? [];
  const week = payload?.charts?.predictionsLast7Days ?? [];

  const gradient = dark
    ? ['#34d399', '#22d3ee', '#a855f7', '#fbbf24', '#fb7185', '#38bdf8', '#fde047']
    : ['#047857', '#0f766e', '#2563eb', '#b45309', '#be123c', '#0369a1', '#65a30d'];

  const barData = {
    labels: top.map((c) => c.crop),
    datasets: [
      {
        label: 'Recommendations logged',
        data: top.map((c) => c.count),
        backgroundColor: top.map((_, i) => gradient[i % gradient.length]),
        borderRadius: 10,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: paletteText } },
      title: {
        display: true,
        text: 'Most recommended crops (recent window)',
        color: paletteText,
        font: { size: 15, weight: '600' },
      },
    },
    scales: {
      x: { ticks: { color: paletteText }, grid: { color: gridColor } },
      y: {
        ticks: { color: paletteText, precision: 0 },
        grid: { color: gridColor },
      },
    },
  };

  const doughnutData = {
    labels: week.map((w) => w.date.slice(5)),
    datasets: [
      {
        label: 'Activity',
        data: week.map((w) => w.count),
        backgroundColor: gradient,
        borderWidth: 2,
        borderColor: dark ? '#0f172a' : '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: paletteText } },
      title: {
        display: true,
        text: '7-day inference pulse',
        color: paletteText,
        font: { size: 15, weight: '600' },
      },
    },
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Analytics HQ</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Chart.js visualizations hydrate from summarized MongoDB projections optimized for dashboards.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <GlassCard className="p-8">
          {top.length ? (
            <div className="h-80 lg:h-[28rem]">
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-400">No analytics yet · run predictions first.</p>
          )}
        </GlassCard>

        <GlassCard className="p-8">
          {week.some((w) => w.count > 0) ? (
            <div className="mx-auto h-80 max-w-lg lg:h-[28rem]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-400">
              Activity ring appears after a week of usage (zeros still render as donut segments for demo days).
            </p>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Why these charts matter</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-3 text-xs text-slate-600 marker:text-emerald-600 dark:text-slate-400">
          <li className="rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-800/60">
            <strong className="text-slate-900 dark:text-white">Trend awareness</strong> — spot bursts when testing new fertilizer recipes.
          </li>
          <li className="rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-800/60">
            <strong className="text-slate-900 dark:text-white">Crop mix</strong> — interview-ready story for precision agriculture stakeholders.
          </li>
          <li className="rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-800/60">
            <strong className="text-slate-900 dark:text-white">User activity graph</strong> — week ring doubles as onboarding health metric.
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
