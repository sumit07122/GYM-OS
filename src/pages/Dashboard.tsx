import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { MetricCard } from '@/components/shared/MetricCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/formatting/currency';
import { formatDateTime, getExpiryStatus } from '@/lib/formatting/dates';
import {
  Users,
  CreditCard,
  QrCode,
  AlertCircle,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { currentGym } = useTenant();
  const navigate = useNavigate();
  const slug = currentGym.slug;

  const members = gymStore.getMembers(currentGym.id);
  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'expiring');
  const todayAttendance = gymStore.getTodayAttendance(currentGym.id);
  const payments = gymStore.getPayments(currentGym.id);

  // Financial KPIs
  const mtdRevenue = payments.reduce((acc, p) => acc + p.amount_paid, 0);
  const totalDues = payments.reduce((acc, p) => acc + p.balance_due, 0);

  // Expiring memberships (within next 7 days)
  const expiringMembers = members.filter(m => {
    if (!m.current_subscription?.end_date) return false;
    const { isExpiringSoon } = getExpiryStatus(m.current_subscription.end_date);
    return isExpiringSoon;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] via-[#161F32] to-[#111827] border border-white/10 rounded-2xl p-6 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Welcome to {currentGym.name}
            </h1>
            <Badge variant="active">Live Production ERP</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant command center. Operating on standard Asia/Kolkata timezone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" size="sm" onClick={() => navigate(`/gym/${slug}/members`)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Member
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/gym/${slug}/attendance`)}>
            <QrCode className="w-4 h-4 mr-1.5" />
            Check-In
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/gym/${slug}/finance`)}>
            <CreditCard className="w-4 h-4 mr-1.5" />
            Collect Fee
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Members"
          value={activeMembers.length}
          subValue={`Total: ${members.length}`}
          trend={{ value: '+8.4% this month', isPositive: true }}
          icon={Users}
        />
        <MetricCard
          label="Today's Attendance"
          value={todayAttendance.length}
          subValue="Peak: 6:00 PM - 8:30 PM"
          icon={QrCode}
          iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        />
        <MetricCard
          label="Monthly Revenue (MTD)"
          value={formatINR(mtdRevenue, false)}
          subValue="INR Collections"
          trend={{ value: '+14.2% vs last month', isPositive: true }}
          icon={CreditCard}
          iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        />
        <MetricCard
          label="Expiring / Overdue Dues"
          value={`${expiringMembers.length} Expiring`}
          subValue={`Dues: ${formatINR(totalDues, false)}`}
          trend={{ value: 'Action Required', isPositive: false }}
          icon={AlertCircle}
          iconColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
        />
      </div>

      {/* Analytics & Real-Time Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Check-in Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Today's Live Attendance Stream
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Real-time check-ins verified at the front desk</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/gym/${slug}/attendance`)}>
                View Terminal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {todayAttendance.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No check-ins recorded yet today. Scan a QR code or use manual check-in.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {todayAttendance.slice(0, 5).map((att) => (
                    <div key={att.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                          {att.member?.full_name.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{att.member?.full_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {att.member?.member_code} • {att.method === 'qr_scan' ? 'QR Code Pass' : 'Manual Reception'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="active" className="text-[10px]">
                          {formatDateTime(att.check_in_time)}
                        </Badge>
                        <p className="text-[10px] text-slate-500 mt-0.5">Verified by {att.verified_by_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Breakdown by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Payment Method Collection Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#090D16] p-3.5 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-400 font-medium">UPI / QR (BHIM/GPay)</p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {formatINR(payments.filter(p => p.payment_method === 'upi').reduce((a, b) => a + b.amount_paid, 0), false)}
                  </p>
                </div>
                <div className="bg-[#090D16] p-3.5 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-400 font-medium">Debit/Credit Cards</p>
                  <p className="text-base font-bold font-mono text-indigo-400 mt-1">
                    {formatINR(payments.filter(p => p.payment_method === 'card').reduce((a, b) => a + b.amount_paid, 0), false)}
                  </p>
                </div>
                <div className="bg-[#090D16] p-3.5 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-400 font-medium">Cash Collections</p>
                  <p className="text-base font-bold font-mono text-amber-400 mt-1">
                    {formatINR(payments.filter(p => p.payment_method === 'cash').reduce((a, b) => a + b.amount_paid, 0), false)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upcoming Renewals & Alert Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Upcoming Expiries (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringMembers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  All memberships active. No expiries in the next 7 days.
                </div>
              ) : (
                <div className="space-y-3">
                  {expiringMembers.map((m) => {
                    const status = getExpiryStatus(m.current_subscription!.end_date);
                    return (
                      <div key={m.id} className="p-3 bg-[#0B0F19] border border-white/5 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{m.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.phone}</p>
                          <p className="text-[10px] text-amber-400 font-medium mt-0.5">{status.label}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/gym/${slug}/finance`)}
                          className="text-xs py-1 px-2.5"
                        >
                          Renew
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* White-Label Quick Notice */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              White-Label Member Portal Ready
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Members can access their digital QR pass, view workout splits, and download GST receipts at{' '}
              <span className="font-mono text-emerald-300">/gym/{slug}/member</span>.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate(`/gym/${slug}/member`)}
            >
              Open Member Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
