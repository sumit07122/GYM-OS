import React, { useState } from 'react';
import { gymStore } from '@/lib/supabase/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/shared/MetricCard';
import { formatINR } from '@/lib/formatting/currency';
import { formatDate } from '@/lib/formatting/dates';
import {
  ShieldAlert,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import { Gym } from '@/types';

export const SuperAdmin: React.FC = () => {
  const gyms = gymStore.getAllGyms();
  const [gymList, setGymList] = useState<Gym[]>(gyms);

  // Platform Metrics
  const activeGymsCount = gymList.filter((g) => g.is_active).length;
  // Illustrative MRR assuming Pro Plan (₹999/mo) per active tenant + ₹5,999 setup fees
  const platformMRR = activeGymsCount * 999;
  const platformSetupFees = activeGymsCount * 5999;

  const toggleGymStatus = (gymId: string) => {
    setGymList((prev) =>
      prev.map((g) => (g.id === gymId ? { ...g, is_active: !g.is_active } : g))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#111827] border border-indigo-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="info" className="mb-2">Platform Master Administration</Badge>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            GymOS SaaS Super Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global tenant governance, subscription recurring revenue (MRR), and platform audit logs
          </p>
        </div>

        <Button variant="primary" size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Provision New Tenant
        </Button>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Gym Tenants"
          value={gymList.length}
          subValue={`${activeGymsCount} Active • 0 Suspended`}
          icon={Building2}
          iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        />
        <MetricCard
          label="Monthly Recurring Revenue (MRR)"
          value={formatINR(platformMRR, false)}
          subValue="Active SaaS Subscriptions"
          trend={{ value: '+24.5% MoM', isPositive: true }}
          icon={TrendingUp}
        />
        <MetricCard
          label="Setup Fee Collections"
          value={formatINR(platformSetupFees, false)}
          subValue="One-time onboarding fees"
          icon={DollarSign}
          iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        />
        <MetricCard
          label="Platform Health"
          value="100.0%"
          subValue="Postgres 17 RLS Enforced"
          icon={CheckCircle2}
          iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Provisioned Gym Tenants
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F19] border-b border-white/10 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Gym Business</th>
                  <th className="py-3 px-4">Slug / Subdomain</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {gymList.map((gym) => (
                  <tr key={gym.id} className="hover:bg-white/5">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-100">{gym.name}</p>
                      <p className="text-[10px] text-slate-500">{gym.legal_business_name || '-'}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {gym.slug}.gymos.in
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {gym.city}, {gym.state}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {gym.phone}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={gym.is_active ? 'active' : 'expired'}>
                        {gym.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={gym.is_active ? 'destructive' : 'primary'}
                        size="sm"
                        onClick={() => toggleGymStatus(gym.id)}
                        className="text-xs py-1"
                      >
                        {gym.is_active ? 'Suspend Gym' : 'Activate Gym'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
