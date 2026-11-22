// GymOS Supabase Live Data Repository & Synchronization Layer
// Queries PostgreSQL PostgREST endpoints when configured, with seamless offline store fallback

import { supabase } from '@/lib/supabase/client';
import { gymStore } from '@/lib/supabase/store';
import type {
  Gym,
  GymSettings,
  GymBranding,
  Member,
  MembershipPlan,
  AttendanceRecord,
  Payment,
  Expense,
  WorkoutPlan,
  DietPlan,
  Lead,
} from '@/types';

class GymosRepository {
  private isConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return Boolean(url && !url.includes('local-demo') && !url.includes('dummy'));
  }

  // --- Gym & Settings ---
  async getGym(slugOrId: string): Promise<Gym | undefined> {
    if (this.isConfigured()) {
      try {
        const query = slugOrId.includes('-') && !slugOrId.startsWith('gym-')
          ? supabase.from('gyms').select('*').eq('slug', slugOrId).single()
          : supabase.from('gyms').select('*').eq('id', slugOrId).single();

        const { data, error } = await query;
        if (!error && data) return data as Gym;
      } catch {
        // Fallback to store
      }
    }
    return gymStore.getGym(slugOrId);
  }

  async getSettings(gymId: string): Promise<GymSettings> {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('gym_settings')
          .select('*')
          .eq('gym_id', gymId)
          .single();
        if (!error && data) return data as GymSettings;
      } catch {
        // Fallback
      }
    }
    return gymStore.getSettings(gymId);
  }

  async getBranding(gymId: string): Promise<GymBranding> {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('gym_branding')
          .select('*')
          .eq('gym_id', gymId)
          .single();
        if (!error && data) return data as GymBranding;
      } catch {
        // Fallback
      }
    }
    return gymStore.getBranding(gymId);
  }

  // --- Members ---
  async getMembers(gymId: string): Promise<Member[]> {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*, member_subscriptions(*, membership_plans(*))')
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            ...m,
            current_subscription: m.member_subscriptions?.[0]
              ? {
                  ...m.member_subscriptions[0],
                  plan: m.member_subscriptions[0].membership_plans,
                }
              : undefined,
          })) as Member[];
        }
      } catch {
        // Fallback
      }
    }
    return gymStore.getMembers(gymId);
  }

  async createMember(
    gymId: string,
    memberData: Omit<Member, 'id' | 'gym_id' | 'created_at' | 'status' | 'member_code'>,
    planId?: string
  ): Promise<Member> {
    if (this.isConfigured()) {
      try {
        const { data: memberCount } = await supabase
          .from('members')
          .select('id', { count: 'exact' })
          .eq('gym_id', gymId);

        const nextNum = (memberCount?.length || 0) + 1;
        const memberCode = `M-${String(nextNum).padStart(5, '0')}`;

        const { data: newMember, error } = await supabase
          .from('members')
          .insert({
            ...memberData,
            gym_id: gymId,
            member_code: memberCode,
            status: 'active',
          })
          .select()
          .single();

        if (!error && newMember) {
          if (planId) {
            const { data: plan } = await supabase
              .from('membership_plans')
              .select('*')
              .eq('id', planId)
              .single();

            if (plan) {
              const startDate = new Date();
              const endDate = new Date();
              endDate.setDate(startDate.getDate() + plan.duration_days);

              await supabase.from('member_subscriptions').insert({
                gym_id: gymId,
                member_id: newMember.id,
                plan_id: plan.id,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                status: 'active',
              });
            }
          }
          return newMember as Member;
        }
      } catch {
        // Fallback
      }
    }
    return gymStore.createMember(gymId, memberData, planId);
  }

  // --- Attendance & Server-Side GPS RPC ---
  async getTodayAttendance(gymId: string): Promise<AttendanceRecord[]> {
    if (this.isConfigured()) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('attendance_records')
          .select('*, members(*)')
          .eq('gym_id', gymId)
          .gte('check_in_time', `${todayStr}T00:00:00Z`)
          .order('check_in_time', { ascending: false });

        if (!error && data) {
          return data.map((a: any) => ({
            ...a,
            member: a.members,
          })) as AttendanceRecord[];
        }
      } catch {
        // Fallback
      }
    }
    return gymStore.getTodayAttendance(gymId);
  }

  async punchAttendanceGps(
    gymId: string,
    memberId: string,
    userLat: number,
    userLon: number
  ): Promise<{ success: boolean; message: string; recordId?: string; distanceMeters?: number }> {
    if (this.isConfigured()) {
      try {
        // Call authoritative server-side PostgreSQL function from migration 0006
        const { data, error } = await supabase.rpc('punch_attendance_gps', {
          p_member_id: memberId,
          p_user_lat: userLat,
          p_user_lon: userLon,
        });

        if (!error && data) {
          return {
            success: data.success,
            message: data.message,
            recordId: data.record_id,
            distanceMeters: data.distance_meters,
          };
        }
      } catch {
        // Fallback
      }
    }
    // Resilient fallback to Haversine store engine
    const res = gymStore.checkInMemberViaGps(gymId, memberId, userLat, userLon);
    return {
      success: res.success,
      message: res.message,
      recordId: res.record?.id,
      distanceMeters: res.distanceMeters,
    };
  }

  // --- Financial POS & Ledger ---
  async getPayments(gymId: string): Promise<Payment[]> {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, members(*)')
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((p: any) => ({
            ...p,
            member: p.members,
          })) as Payment[];
        }
      } catch {
        // Fallback
      }
    }
    return gymStore.getPayments(gymId);
  }

  async getExpenses(gymId: string): Promise<Expense[]> {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('gym_id', gymId)
          .order('date', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Expense[];
        }
      } catch {
        // Fallback
      }
    }
    return gymStore.getExpenses(gymId);
  }

  // --- Plans, Workouts, Diets, Leads ---
  async getPlans(gymId: string): Promise<MembershipPlan[]> {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('gym_id', gymId)
          .eq('is_active', true);

        if (!error && data && data.length > 0) return data as MembershipPlan[];
      } catch {
        // Fallback
      }
    }
    return gymStore.getPlans(gymId);
  }

  async getWorkouts(gymId: string): Promise<WorkoutPlan[]> {
    return gymStore.getWorkouts(gymId);
  }

  async getDiets(gymId: string): Promise<DietPlan[]> {
    return gymStore.getDiets(gymId);
  }

  async getLeads(gymId: string): Promise<Lead[]> {
    return gymStore.getLeads(gymId);
  }
}

export const gymosRepository = new GymosRepository();
