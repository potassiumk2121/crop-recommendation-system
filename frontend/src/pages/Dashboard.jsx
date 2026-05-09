import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { api } from '../api/client.js';
import { useTheme } from '../context/ThemeContext.jsx';

function chartPalette(isDark) {
  const grid = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(15,118,110,0.14)';
  const text = isDark ? '#cbd5f5' : '#0f172a';
  const line = isDark ? 'rgba(52,211,153,1)' : 'rgba(5,122,105,1)';
  const fill = isDark ? 'rgba(52,211,153,0.22)' : 'rgba(16,185,129,0.28)';
  return { grid, text, line, fill };
}

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const dark = theme === 'dark';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/analytics/summary', { params: { days: 21 } });
        if (!cancelled) setData(res.data);
      } catch (err) {
        toast.error(err.message || 'Unable to load analytics');
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Syncing dashboard…" />
      </div>
    );
  }

  const trend = data?.charts?.predictionTrend || [];
  const top = data?.charts?.mostRecommendedCrops?.slice(0, 6) || [];
  const palette = chartPalette(dark);

  const lineData = {
    labels: trend.map((t) => t.date.slice(5)),
    datasets: [
      {
        label: 'Predictions / day',
        data: trend.map((t) => t.count),
        borderColor: palette.line,
        backgroundColor: palette.fill,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: palette.text } },
      title: {
        display: true,
        text: 'Prediction activity trend',
        color: palette.text,
        font: { size: 15, weight: '600' },
      },
    },
    scales: {
      x: {
        ticks: { color: palette.text },
        grid: { color: palette.grid },
      },
      y: {
        ticks: { color: palette.text, precision: 0 },
        grid: { color: palette.grid },
      },
    },
  };

  const total = data?.summary?.totalPredictions ?? 0;
  const recent = data?.summary?.recentPredictionsInWindow ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Farmer cockpit
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Live aggregates from MongoDB-backed prediction history · Chart.js viz
          </p>
        </div>
        <Link to="/app/predict" className="btn-primary px-8 py-3">
          Run new prediction
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard delay={0.05}>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total predictions stored</p>
          <p className="mt-3 font-display text-4xl font-bold text-emerald-700 dark:text-emerald-300">
            {total}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Persisted automatically every time Flask returns a recommendation.
          </p>
        </GlassCard>

        <GlassCard delay={0.1}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Predictions ({data?.summary?.windowDays ?? 14} days)
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-teal-700 dark:text-teal-300">
            {recent}
          </p>
          <p className="mt-3 text-xs text-slate-500">Great for spotting seasonal bursts of testing.</p>
        </GlassCard>

        <GlassCard delay={0.15}>
          <p className="text-sm text-slate-600 dark:text-slate-400">Top crop this window</p>
          <p className="mt-3 font-display text-2xl font-semibold capitalize text-slate-900 dark:text-white">
            {top[0]?.crop || '—'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Driven by aggregated Random Forest inference labels for your account only.
          </p>
        </GlassCard>
      </div>

      <GlassCard delay={0.2} className="lg:p-8">
        {trend.length ? (
          <div className="h-72 w-full md:h-80">
            <Line data={lineData} options={lineOptions} />
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Run your first prediction to unlock trend visuals.
            </p>
            <Link to="/app/predict" className="btn-primary mt-6">
              Open prediction lab
            </Link>
          </div>
        )}
      </GlassCard>

      <GlassCard delay={0.25}>
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Leading recommendations
        </h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top.length ? (
            top.map(({ crop, count }, idx) => (
              <div
                key={crop}
                className="flex items-center justify-between rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-slate-800/50"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    #{idx + 1}
                  </p>
                  <p className="font-medium capitalize text-slate-900 dark:text-white">{crop}</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100">
                  {count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">No labelled runs yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
