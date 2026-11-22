import React from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatting/dates';
import {
  Dumbbell,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const TrainerPortal: React.FC = () => {
  const { currentGym, currentUser } = useTenant();
  const members = gymStore.getMembers(currentGym.id);
  const trainers = gymStore.getTrainers(currentGym.id);
  const currentTrainer = trainers[0]; // Active demonstration trainer (Kabir Sharma)
  
  // Filter assigned members
  const assignedMembers = members.filter(m => m.assigned_trainer_id === currentTrainer?.id);
  const workouts = gymStore.getWorkouts(currentGym.id);
  const diets = gymStore.getDiets(currentGym.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#111827] to-[#111827] border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="active" className="mb-2">Trainer Command Portal</Badge>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Coach {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Specialization: {currentTrainer?.specialization.join(', ') || 'Hypertrophy & Conditioning'} • Active PT Roster: {assignedMembers.length} Athletes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="py-1 px-3 text-xs">
            Capacity: {assignedMembers.length} / {currentTrainer?.max_clients || 20}
          </Badge>
        </div>
      </div>

      {/* Assigned Clients Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Assigned Personal Training Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5 text-xs">
                {assignedMembers.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No clients assigned to this trainer yet.
                  </div>
                ) : (
                  assignedMembers.map((client) => (
                    <div key={client.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                          {client.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{client.full_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{client.member_code} • {client.phone}</p>
                          <p className="text-[10px] text-emerald-400 mt-0.5">
                            Plan: {client.current_subscription?.plan?.name || 'Annual Elite'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Prescribe Split
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Training Routine Templates */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="border-b border-white/10 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Active Training Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {workouts.map((w) => (
                <div key={w.id} className="p-3 bg-[#090D16] border border-white/5 rounded-lg space-y-1">
                  <p className="font-bold text-white">{w.title}</p>
                  <p className="text-[11px] text-slate-400">{w.goal}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{w.exercises?.length || 3} exercises configured</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
