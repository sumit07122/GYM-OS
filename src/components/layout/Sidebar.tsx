import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTenant } from '@/lib/tenant/context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  Dumbbell,
  Utensils,
  Receipt,
  UserCheck,
  TrendingUp,
  Settings,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentGym, allGyms, setGym, branding, activeRole } = useTenant();
  const slug = currentGym.slug;

  const ownerNavGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: `/gym/${slug}/dashboard` },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { label: 'Members', icon: Users, path: `/gym/${slug}/members` },
        { label: 'Attendance & GPS', icon: QrCode, path: `/gym/${slug}/attendance` },
        { label: 'Membership Plans', icon: CreditCard, path: `/gym/${slug}/plans` },
        { label: 'Leads & Enquiries', icon: UserCheck, path: `/gym/${slug}/leads` },
      ],
    },
    {
      label: 'FINANCE & POS',
      items: [
        { label: 'Payments & Receipts', icon: Receipt, path: `/gym/${slug}/finance` },
        { label: 'Expenses Ledger', icon: TrendingUp, path: `/gym/${slug}/expenses` },
      ],
    },
    {
      label: 'FITNESS & TRAINING',
      items: [
        { label: 'Trainers & Staff', icon: Users, path: `/gym/${slug}/staff` },
        { label: 'Workout Library', icon: Dumbbell, path: `/gym/${slug}/workouts` },
        { label: 'Diet & Nutrition', icon: Utensils, path: `/gym/${slug}/diets` },
      ],
    },
    {
      label: 'CONFIGURATION',
      items: [
        { label: 'Settings & Geofence', icon: Settings, path: `/gym/${slug}/settings` },
        { label: 'Super Admin Portal', icon: ShieldAlert, path: `/super-admin` },
      ],
    },
  ];

  const memberNavGroups = [
    {
      label: 'MEMBER PASS',
      items: [
        { label: 'Digital Pass & GPS', icon: Sparkles, path: `/gym/${slug}/member` },
      ],
    },
    {
      label: 'FITNESS & NUTRITION',
      items: [
        { label: 'My Workout Routine', icon: Dumbbell, path: `/gym/${slug}/workouts` },
        { label: 'My Nutrition Split', icon: Utensils, path: `/gym/${slug}/diets` },
      ],
    },
  ];

  const navGroups = activeRole === 'member' ? memberNavGroups : ownerNavGroups;

  return (
    <aside className="w-64 bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-white/10 flex flex-col h-screen select-none shrink-0 transition-colors duration-150">
      {/* Brand & Tenant Header */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-glow overflow-hidden shrink-0">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={currentGym.name} className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">{currentGym.name}</h1>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">slug: {currentGym.slug}</p>
          </div>
        </div>

        {/* Tenant Switcher (if multiple gyms) */}
        {allGyms.length > 1 && (
          <div className="mt-3">
            <select
              value={currentGym.id}
              onChange={(e) => {
                const found = allGyms.find(g => g.id === e.target.value);
                if (found) setGym(found);
              }}
              className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              {allGyms.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Authenticated Mode Indicator */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                {activeRole === 'member' ? 'Member Portal' : 'Owner ERP Suite'}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {activeRole === 'member' ? 'Pass' : 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* GymOS SaaS Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090D16]">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>GymOS v1.0.0</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">Enterprise ERP</span>
        </div>
      </div>
    </aside>
  );
};