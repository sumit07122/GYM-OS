import React from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/formatting/currency';
import { formatDate } from '@/lib/formatting/dates';
import {
  Users,
  ShieldCheck,
  Dumbbell,
  PlusCircle,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

export const Staff: React.FC = () => {
  const { currentGym } = useTenant();
  const staff = gymStore.getStaff(currentGym.id);
  const trainers = gymStore.getTrainers(currentGym.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Staff & Trainer Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage fitness trainers, reception staff, operational roles, and salary compensation
          </p>
        </div>

        <Button variant="primary" size="sm">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Add Employee / Trainer
        </Button>
      </div>

      {/* Staff Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((employee) => {
          const trainerInfo = trainers.find((t) => t.staff_id === employee.id);

          return (
            <Card key={employee.id} className="hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <CardHeader className="flex flex-row items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200 overflow-hidden shrink-0">
                    {employee.profile?.avatar_url ? (
                      <img src={employee.profile.avatar_url} alt={employee.profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      employee.profile?.full_name.charAt(0) || 'E'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-bold text-white truncate">
                      {employee.profile?.full_name}
                    </CardTitle>
                    <Badge variant="active" className="text-[10px] mt-1 capitalize">
                      {employee.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 text-xs">
                  <div className="space-y-1 text-slate-400">
                    <p className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {employee.profile?.phone || '+91 98000 00000'}
                    </p>
                    <p className="flex items-center gap-2 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      {employee.profile?.email}
                    </p>
                  </div>

                  {trainerInfo && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Client Capacity:</span>
                        <span className="font-semibold text-emerald-400 font-mono">14 / {trainerInfo.max_clients}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">PT Commission:</span>
                        <span className="font-semibold text-slate-200 font-mono">{trainerInfo.pt_commission_percent}% per client</span>
                      </div>
                      {trainerInfo.bio && (
                        <p className="text-[10px] text-slate-400 italic bg-[#090D16] p-2 rounded">
                          "{trainerInfo.bio}"
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Monthly Compensation:</span>
                    <span className="font-bold text-slate-100 font-mono">{formatINR(employee.salary_monthly, false)}</span>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Manage Permissions
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
