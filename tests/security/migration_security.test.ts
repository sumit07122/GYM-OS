import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Migration 0006 Security Hardening Audit', () => {
  const migrationPath = path.resolve(__dirname, '../../supabase/migrations/0006_security_hardening_and_rpc.sql');

  it('migration 0006 exists and closes RLS vulnerabilities in workout exercises and diet meals', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const content = fs.readFileSync(migrationPath, 'utf8');

    // Closes insecure policies
    expect(content).toContain('DROP POLICY IF EXISTS "exercises_mutate" ON public.workout_exercises');
    expect(content).toContain('DROP POLICY IF EXISTS "meals_mutate" ON public.diet_meals');
    expect(content).toContain('DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs');

    // Scoped policies
    expect(content).toContain('CREATE POLICY "exercises_mutate" ON public.workout_exercises');
    expect(content).toContain('is_gym_staff');
    expect(content).toContain('CREATE POLICY "meals_mutate" ON public.diet_meals');
  });

  it('migration 0006 contains server-side punch_attendance_gps security definer RPC function', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    expect(content).toContain('CREATE OR REPLACE FUNCTION public.punch_attendance_gps');
    expect(content).toContain('SECURITY DEFINER');
    expect(content).toContain('gps_geofence');
    expect(content).toContain('6371000'); // Haversine earth radius meters
    // Must enforce that caller is either the member themselves (auth.uid() = user_id) or staff
    expect(content).toContain('auth.uid()');
    expect(content).toContain('v_member_user_id != auth.uid()');
  });
});
