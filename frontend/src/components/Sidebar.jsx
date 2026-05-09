import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Leaf,
  History,
  BarChart3,
  LogOut,
  Sprout,
} from './icons.jsx';

const links = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/predict', label: 'Predict Crop', icon: Leaf },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ onNavigate, user, onLogout }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/30 bg-white/40 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/60">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-700/40">
          <Sprout className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            AgriBrain
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Crop ML Suite</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `${isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}`
            }
          >
            <Icon className="h-5 w-5 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/40 bg-white/40 p-3 dark:border-white/10 dark:bg-slate-900/60">
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">Signed in</p>
        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
        <p className="truncate text-xs text-slate-600 dark:text-slate-400">{user?.email}</p>
      </div>

      <button type="button" onClick={onLogout} className="btn-ghost mt-3 w-full justify-center">
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
