import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/lib/tenant/context';
import { useTheme } from '@/lib/theme/context';
import { useAuth } from '@/lib/auth/context';
import { format } from 'date-fns';
import { Bell, Search, ShieldAlert, Sparkles, CheckCircle2, Sun, Moon, Laptop, LogOut, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentGym, activeRole, currentUser } = useTenant();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const todayFormatted = format(new Date(), 'EEEE, dd MMM yyyy');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none transition-colors duration-150">
      {/* Left: Mobile Menu Toggle + Gym Badge & Date */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-xs">{currentGym.name}</h2>
            <Badge variant="active" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Tenant
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">{todayFormatted}</p>
        </div>
      </div>

      {/* Center Search / Kiosk helper */}
      <div className="hidden xl:flex items-center w-80 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Search className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
        <span className="truncate">Quick Member Search (M-001 or Phone)...</span>
        <kbd className="ml-auto text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">Ctrl+K</kbd>
      </div>

      {/* Right: Theme Toggle, Notifications, User Role Badge & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle (Light / Dark / System) */}
        <div className="flex items-center bg-slate-100 dark:bg-[#111827] p-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs">
          <button
            type="button"
            title="Light Theme"
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded transition-colors ${
              theme === 'light'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Dark Theme"
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-[#151D2E] text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Device System Theme"
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded transition-colors ${
              theme === 'system'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Authenticated Role Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {activeRole === 'member' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Member Pass</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gym Owner</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0F19]" />
        </button>

        {/* User Card & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{currentUser.full_name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
              {currentUser.email}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
            {currentUser.full_name.charAt(0)}
          </div>
          <button
            type="button"
            title="Sign Out"
            onClick={handleSignOut}
            className="p-1.5 ml-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};