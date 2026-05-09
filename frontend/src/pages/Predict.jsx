import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { GlassCard } from '../components/GlassCard.jsx';

const FIELDS = [
  { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha scale', min: 0, max: 150, step: 1 },
  { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha scale', min: 0, max: 150, step: 1 },
  { key: 'K', label: 'Potassium (K)', unit: 'kg/ha scale', min: 0, max: 150, step: 1 },
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    min: -5,
    max: 55,
    step: 0.1,
  },
  { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 0.1 },
  { key: 'ph', label: 'Soil pH', unit: '0–14', min: 0, max: 14, step: 0.1 },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 600, step: 0.1 },
];

const INITIAL = Object.fromEntries(FIELDS.map((f) => [f.key, '']));

/** Client-side mirrors Express validators to fail fast before network I/O. */
function validate(form) {
  const errs = {};
  for (const f of FIELDS) {
    const raw = form[f.key];
    if (raw === '' || raw === null) {
      errs[f.key] = 'Required';
      continue;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      errs[f.key] = 'Must be a number';
    } else if (num < f.min || num > f.max) {
      errs[f.key] = `${f.min} – ${f.max}`;
    }
  }
  return errs;
}

export function Predict() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);

  const onChange = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length) {
      setErrors(v);
      toast.error('Please fix highlighted fields.');
      return;
    }

    const payload = {};
    for (const f of FIELDS) payload[f.key] = Number(form[f.key]);

    setBusy(true);
    try {
      const { data } = await api.post('/predictions', payload);
      setLast(data.prediction);
      toast.success(`Suggested crop · ${data.prediction.predictedCrop}`);
      setForm(INITIAL);
    } catch (err) {
      const list = err.response?.data?.errors;
      const first = Array.isArray(list) ? list[0]?.msg : err.message;
      toast.error(first || 'Prediction failed');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setForm({
      N: '90',
      P: '42',
      K: '43',
      temperature: '20.8',
      humidity: '82',
      ph: '6.5',
      rainfall: '200',
    });
    toast('Loaded demo soil readings', { icon: '✨' });
  };

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Prediction lab
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Parameters match the Flask / Sklearn Random Forest training vector.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <GlassCard delay={0.05} className="lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/30 pb-4 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Soil & atmosphere inputs
              </p>
              <p className="text-xs text-slate-500">
                Validates client-side · Server re-validates with express-validator · Persists Mongo record
              </p>
            </div>
            <button type="button" className="btn-ghost text-xs uppercase tracking-wide" onClick={fillDemo}>
              Inject demo row
            </button>
          </div>

          <form className="mt-8 grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
            {FIELDS.map((f) => (
              <label key={f.key} className="text-sm">
                <span className="flex items-baseline justify-between font-medium text-slate-700 dark:text-slate-200">
                  <span>{f.label}</span>
                  <span className="text-xs font-normal text-slate-500">{f.unit}</span>
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form[f.key]}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className={`glass-input mt-2 ${errors[f.key] ? 'ring-rose-400 focus:ring-rose-400' : ''}`}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                />
                {errors[f.key] ? (
                  <p className="mt-1 text-xs text-rose-600">{errors[f.key]}</p>
                ) : null}
              </label>
            ))}
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary flex-1 min-w-[200px] justify-center py-3" disabled={busy}>
                {busy ? 'Running Random Forest inference…' : 'Get recommendation'}
              </button>
            </div>
          </form>
        </GlassCard>

        <div className="space-y-6 lg:col-span-2">
          <GlassCard delay={0.1}>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Latest verdict
            </h3>
            {last ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-500/90 to-teal-600/90 px-6 py-8 text-center text-white shadow-xl shadow-emerald-900/30"
              >
                <p className="text-sm uppercase tracking-[0.2em] opacity-85">Suggested crop</p>
                <p className="mt-4 font-display text-4xl font-bold capitalize">{last.predictedCrop}</p>
                {typeof last.confidence === 'number' ? (
                  <p className="mt-4 text-sm opacity-95">
                    Model confidence {(last.confidence * 100).toFixed(1)}%
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                Results appear here instantly after inference; each run is mirrored to Atlas for dashboards.
              </p>
            )}
          </GlassCard>

          <GlassCard delay={0.15}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Behind the curtain</h4>
            <ol className="mt-4 list-decimal space-y-3 pl-4 text-xs text-slate-600 marker:text-emerald-600 dark:text-slate-400">
              <li>Express persists user context + sanitized payload.</li>
              <li>Axios relays to Flask Random Forest pickled artifact.</li>
              <li>Prediction document stores ISO timestamps automatically.</li>
            </ol>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
