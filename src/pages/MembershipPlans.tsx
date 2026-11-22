import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { MembershipPlan } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatINR } from '@/lib/formatting/currency';
import {
  CreditCard,
  PlusCircle,
  Check,
  Sparkles,
  Users,
  Clock,
} from 'lucide-react';

export const MembershipPlans: React.FC = () => {
  const { currentGym } = useTenant();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('365');
  const [price, setPrice] = useState('');
  const [admissionFee, setAdmissionFee] = useState('1000');
  const [isPtIncluded, setIsPtIncluded] = useState(false);
  const [ptSessions, setPtSessions] = useState('0');
  const [description, setDescription] = useState('');

  const plans = gymStore.getPlans(currentGym.id);
  const members = gymStore.getMembers(currentGym.id);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const durationNum = parseInt(durationDays, 10);
    if (!name || isNaN(priceNum) || isNaN(durationNum)) return;

    gymStore.createPlan(currentGym.id, {
      name,
      duration_days: durationNum,
      price: priceNum,
      admission_fee: parseFloat(admissionFee) || 0,
      is_pt_included: isPtIncluded,
      pt_sessions_count: parseInt(ptSessions, 10) || 0,
      description,
    });

    setIsCreateModalOpen(false);
    // Reset Form
    setName('');
    setPrice('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Membership Packages & Tiers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure flexible duration packages, admission fees, and personal training entitlements
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create New Plan
        </Button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const enrolledCount = members.filter(
            (m) => m.current_subscription?.plan_id === plan.id
          ).length;

          return (
            <Card key={plan.id} className="relative flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
              <div>
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="active" className="text-[10px]">
                      {plan.duration_days} Days
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{enrolledCount} Active</span>
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors">
                    {plan.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-400">
                      {formatINR(plan.price, false)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      + {formatINR(plan.admission_fee, false)} Admission Fee
                    </p>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {plan.description || 'Full access to gym equipment and cardio training zone.'}
                  </p>

                  <div className="space-y-1.5 border-t border-white/5 pt-3 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Facility Floor Access</span>
                    </div>
                    {plan.is_pt_included && (
                      <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{plan.pt_sessions_count} PT Sessions Included</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Digital QR Mobile Pass</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Edit Plan Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Plan Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Membership Package"
        description="Define duration, pricing, and trainer benefits for this package."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <Input
            label="Package Name *"
            placeholder="e.g. 6 Months Strength Pro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (in Days) *"
              type="number"
              placeholder="365"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              required
            />
            <Input
              label="Package Price (INR) *"
              type="number"
              placeholder="12000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <Input
            label="One-Time Admission Fee (INR)"
            type="number"
            placeholder="1000"
            value={admissionFee}
            onChange={(e) => setAdmissionFee(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPt"
              checked={isPtIncluded}
              onChange={(e) => setIsPtIncluded(e.target.checked)}
              className="rounded bg-[#0D1322] border-white/20 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isPt" className="text-slate-300 font-medium">
              Include Personal Training (PT) Sessions
            </label>
          </div>

          {isPtIncluded && (
            <Input
              label="Number of PT Sessions"
              type="number"
              placeholder="5"
              value={ptSessions}
              onChange={(e) => setPtSessions(e.target.value)}
            />
          )}

          <Input
            label="Package Description"
            placeholder="Key perks, facilities included, or rules"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Package
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
