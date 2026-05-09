import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sidebar } from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Moon, Sun, Menu } from './icons.jsx';

/** Shell with responsive sidebar drawer and dark-mode toggle. */
export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out securely');
    setOpen(false);
  };

  return (
    <div className="relative flex min-h-screen bg-field-radial">
      {/* Mobile sidebar overlay */}
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:block`}
      >
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={() => setOpen(false)}
        />
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/30 bg-white/50 px-4 py-3 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/50 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-ghost md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Crop Recommendation System
              </h1>
              <p className="hidden text-xs text-slate-600 dark:text-slate-400 sm:block">
                ML-powered agronomy companion — Random Forest • Flask • MongoDB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleTheme()}
            className="btn-ghost flex items-center gap-2"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>

        <footer className="border-t border-white/20 px-4 py-4 text-center text-xs text-slate-600 dark:border-white/5 dark:text-slate-500 md:px-8">
          Final-year / portfolio-ready stack — React · Express · Flask · Atlas
        </footer>
      </div>
    </div>
  );
}
