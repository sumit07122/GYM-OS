import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/lib/tenant/context';
import { format } from 'date-fns';
import { Bell, Search, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Header: React.FC = () => {
  const { currentGym, activeRole, setActiveRole, currentUser } = useTenant();
  const navigate = useNavigate();
  const todayFormatted = format(new Date(), 'EEEE, dd MMM yyyy');

  return (
    <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Gym Badge & Date */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100">{currentGym.name}</h2>
            <Badge variant="active" className="text-[10px] py-0 px-1.5 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Tenant
            </Badge>
          </div>
          <p className="text-xs text-slate-400">{todayFormatted}</p>
        </div>
      </div>

      {/* Center Search / Kiosk helper */}
      <div className="hidden md:flex items-center w-80 bg-[#111827] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400">
        <Search className="w-4 h-4 mr-2 text-slate-500" />
        <span className="text-slate-400 truncate">Quick Member Search (M-001 or Phone)...</span>
        <kbd className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+K</kbd>
      </div>

      {/* Right: Quick Role Switcher, Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Role Toggle in Header */}
        <div className="hidden lg:flex items-center bg-[#111827] p-1 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveRole('gym_owner');
              navigate(`/gym/${currentGym.slug}/dashboard`);
            }}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeRole === 'gym_owner'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Owner Mode
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('member');
              navigate(`/gym/${currentGym.slug}/member`);
            }}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeRole === 'member'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Member Mode
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0B0F19]" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{currentUser.full_name}</p>
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
              {activeRole === 'member' ? 'MEMBER' : 'GYM OWNER'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
            {currentUser.full_name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
