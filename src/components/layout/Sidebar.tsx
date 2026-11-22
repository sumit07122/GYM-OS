import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
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
  Building2,
  ChevronDown,
} from 'lucide-react';
import { GymRole } from '@/types';

export const Sidebar: React.FC = () => {
  const { currentGym, allGyms, setGym, branding, activeRole, setActiveRole } = useTenant();
  const slug = currentGym.slug;

  const navGroups = [
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
        { label: 'Attendance & QR', icon: QrCode, path: `/gym/${slug}/attendance` },
        { label: 'Membership Plans', icon: CreditCard, path: `/gym/${slug}/plans` },
        { label: 'Leads & Enquiries', icon: UserCheck, path: `/gym/${slug}/leads` },
      ],
    },
    {
      label: 'FINANCE & POS',
      items: [
        { label: 'Payments & POS', icon: Receipt, path: `/gym/${slug}/finance` },
        { label: 'Expenses', icon: TrendingUp, path: `/gym/${slug}/expenses` },
      ],
    },
    {
      label: 'FITNESS',
      items: [
        { label: 'Trainers & Staff', icon: Users, path: `/gym/${slug}/staff` },
        { label: 'Workout Plans', icon: Dumbbell, path: `/gym/${slug}/workouts` },
        { label: 'Diet Plans', icon: Utensils, path: `/gym/${slug}/diets` },
      ],
    },
    {
      label: 'PORTALS',
      items: [
        { label: 'Trainer Portal', icon: Dumbbell, path: `/gym/${slug}/trainer` },
        { label: 'Member Pass & Portal', icon: Sparkles, path: `/gym/${slug}/member` },
      ],
    },
    {
      label: 'CONFIGURATION',
      items: [
        { label: 'Settings & Branding', icon: Settings, path: `/gym/${slug}/settings` },
        { label: 'Super Admin Portal', icon: ShieldAlert, path: `/super-admin` },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-white/10 flex flex-col h-screen select-none shrink-0">
      {/* Brand & Tenant Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-glow overflow-hidden shrink-0">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={currentGym.name} className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-5 h-5 text-[#090D16]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-100 truncate tracking-tight">{currentGym.name}</h1>
            <p className="text-[11px] text-emerald-400 font-mono truncate">slug: {currentGym.slug}</p>
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
              className="w-full bg-[#111827] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              {allGyms.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Active Role Switcher for Testing & Persona Inspection */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Active Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as GymRole)}
            className="bg-[#151D2E] text-emerald-400 text-[11px] font-medium border border-emerald-500/30 rounded px-1.5 py-0.5 focus:outline-none"
          >
            <option value="gym_owner">Gym Owner</option>
            <option value="gym_manager">Gym Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="trainer">Trainer</option>
            <option value="member">Member</option>
            <option value="platform_super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-1.5">
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
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
      <div className="p-3 border-t border-white/10 bg-[#090D16]">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>GymOS v1.0.0</span>
          <span className="text-emerald-400 font-mono font-medium">Enterprise ERP</span>
        </div>
      </div>
    </aside>
  );
};
