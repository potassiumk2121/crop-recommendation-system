/** Centered emerald pulse used for buttons and page-level loading states. */
export function LoadingSpinner({ label, size = 'md' }) {
  const dim = size === 'sm' ? 'h-6 w-6 border-2' : 'h-12 w-12 border-[3px]';
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${dim} animate-spin rounded-full border-emerald-500/30 border-t-emerald-600 dark:border-emerald-400/25 dark:border-t-emerald-300`}
        aria-hidden
      />
      {label ? <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p> : null}
    </div>
  );
}
