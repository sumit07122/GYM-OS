import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Dumbbell,
  Utensils,
  PlusCircle,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Fitness: React.FC = () => {
  const { currentGym } = useTenant();
  const [activeTab, setActiveTab] = useState<'workouts' | 'diets'>('workouts');

  const workouts = gymStore.getWorkouts(currentGym.id);
  const diets = gymStore.getDiets(currentGym.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            Workout Splits & Nutrition Prescriptions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build custom training splits, exercise sets/reps/rest timers, and Indian dietary macro schedules
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#111827] border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('workouts')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'workouts'
                ? 'bg-emerald-500 text-[#090D16] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Workout Routines
          </button>
          <button
            onClick={() => setActiveTab('diets')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'diets'
                ? 'bg-emerald-500 text-[#090D16] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Diet Plans
          </button>
        </div>
      </div>

      {/* Workouts View */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {workouts.map((plan) => (
            <Card key={plan.id} className="overflow-hidden border-white/10">
              <CardHeader className="bg-[#0B0F19] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-white">{plan.title}</CardTitle>
                    <Badge variant="active" className="text-[10px]">
                      {plan.difficulty_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-400 mt-0.5">Goal: {plan.goal}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Edit Exercises
                </Button>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {plan.notes && (
                  <p className="text-xs text-slate-400 italic bg-[#090D16] p-3 rounded-lg border border-white/5">
                    Coach Remarks: {plan.notes}
                  </p>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Day-by-Day Exercise Routine
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {plan.exercises?.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-3 bg-[#090D16] border border-white/5 rounded-lg space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-emerald-400">
                            {ex.day_of_week} • {ex.muscle_group}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ex.rest_seconds}s Rest
                          </span>
                        </div>
                        <p className="font-semibold text-slate-100">{ex.exercise_name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>{ex.sets} Sets</span>
                          <span>•</span>
                          <span>{ex.reps} Reps</span>
                          {ex.target_weight_kg && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">{ex.target_weight_kg} kg</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diets View */}
      {activeTab === 'diets' && (
        <div className="space-y-6">
          {diets.map((diet) => (
            <Card key={diet.id} className="overflow-hidden border-white/10">
              <CardHeader className="bg-[#0B0F19] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-white">{diet.title}</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span className="text-emerald-400 font-bold">{diet.daily_calories} kcal / day</span>
                    <span>•</span>
                    <span>Protein: {diet.protein_grams}g</span>
                    <span>•</span>
                    <span>Carbs: {diet.carbs_grams}g</span>
                    <span>•</span>
                    <span>Fats: {diet.fats_grams}g</span>
                    <span>•</span>
                    <span>Water: {diet.water_liters}L</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Edit Meals
                </Button>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {diet.notes && (
                  <p className="text-xs text-slate-400 italic bg-[#090D16] p-3 rounded-lg border border-white/5">
                    Nutrition Notes: {diet.notes}
                  </p>
                )}

                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Daily Meal Schedule
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diet.meals?.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 bg-[#090D16] border border-white/5 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-bold text-white">{m.meal_name}</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {m.calories} kcal ({m.protein_grams}g Protein)
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{m.food_items}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
