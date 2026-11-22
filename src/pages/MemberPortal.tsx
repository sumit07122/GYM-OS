import React from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, getExpiryStatus } from '@/lib/formatting/dates';
import { formatINR } from '@/lib/formatting/currency';
import {
  QrCode,
  Sparkles,
  Dumbbell,
  Receipt,
  Utensils,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
} from 'lucide-react';

export const MemberPortal: React.FC = () => {
  const { currentGym, branding } = useTenant();
  const members = gymStore.getMembers(currentGym.id);
  const currentMember = members[0]; // Active demonstration member (Aarav Mehta)
  const payments = gymStore.getPayments(currentGym.id).filter(p => p.member_id === currentMember?.id);
  const workouts = gymStore.getWorkouts(currentGym.id);
  const diets = gymStore.getDiets(currentGym.id);

  if (!currentMember) {
    return (
      <div className="text-center py-16 text-slate-500">
        No member records available. Please register a member in the Admin ERP.
      </div>
    );
  }

  const sub = currentMember.current_subscription;
  const expiry = sub ? getExpiryStatus(sub.end_date) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#111827] to-[#111827] border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="active" className="mb-2">Digital Member Access Pass</Badge>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {currentMember.full_name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Member Code: <span className="font-mono text-emerald-400">{currentMember.member_code}</span> • Facility: {currentGym.name}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
          <Printer className="w-4 h-4" />
          Print Pass
        </Button>
      </div>

      {/* Digital Gym ID Card Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: QR Digital Pass Card */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-b from-[#111827] to-[#090D16] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-glow text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">{currentGym.name}</span>
            </div>

            {/* Simulated Live Rotating QR Code */}
            <div className="p-4 bg-white rounded-xl mx-auto w-44 h-44 flex flex-col items-center justify-center shadow-lg">
              <QrCode className="w-36 h-36 text-[#090D16]" />
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase">{currentMember.full_name}</p>
              <p className="text-[11px] font-mono text-emerald-400">{currentMember.member_code}</p>
              <p className="text-[10px] text-slate-500 mt-1">Scan at front desk entrance turnstile</p>
            </div>
          </div>
        </div>

        {/* Right Column: Plan Status & Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Active Membership Validity</span>
                <Badge variant={expiry?.isExpired ? 'expired' : 'active'}>
                  {sub?.status.toUpperCase() || 'ACTIVE'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#090D16] p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Plan Tier</span>
                  <p className="text-sm font-bold text-white mt-0.5">{sub?.plan?.name || 'Annual Elite'}</p>
                </div>
                <div className="bg-[#090D16] p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Validity Remaining</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">{expiry?.label || '365 Days'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-white/5 text-[11px]">
                <span>Start Date: {formatDate(sub?.start_date)}</span>
                <span>End Date: {formatDate(sub?.end_date)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Workout & Nutrition Snippet */}
          <Card>
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Assigned Training & Nutrition Split
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {workouts[0] && (
                <div className="p-3 bg-[#090D16] rounded-lg border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Workout Plan</span>
                  <p className="font-semibold text-white mt-0.5">{workouts[0].title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{workouts[0].goal}</p>
                </div>
              )}
              {diets[0] && (
                <div className="p-3 bg-[#090D16] rounded-lg border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Dietary Nutrition</span>
                  <p className="font-semibold text-white mt-0.5">{diets[0].title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {diets[0].daily_calories} kcal • {diets[0].protein_grams}g Protein • {diets[0].water_liters}L Water
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment History & Downloadable Receipts */}
      <Card>
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Payment History & Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F19] border-b border-white/10 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No invoices recorded for this account.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">{p.invoice_number}</td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(p.created_at)}</td>
                      <td className="py-3 px-4 capitalize">{p.payment_type.replace('_', ' ')}</td>
                      <td className="py-3 px-4 uppercase">{p.payment_method}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatINR(p.amount_paid)}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="active" className="text-[10px]">Paid</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
