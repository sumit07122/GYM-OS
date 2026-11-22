-- Migration 0006: Security Hardening & Server-Side GPS Attendance RPC
-- Engine: PostgreSQL 17

-- 1. Close RLS Vulnerabilities on Workout Exercises
DROP POLICY IF EXISTS "exercises_select" ON public.workout_exercises;
DROP POLICY IF EXISTS "exercises_mutate" ON public.workout_exercises;

CREATE POLICY "exercises_select" ON public.workout_exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workout_plans wp
    WHERE wp.id = workout_plan_id
      AND (
        public.is_gym_staff(wp.gym_id)
        OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = wp.member_id AND m.user_id = auth.uid())
        OR public.is_platform_super_admin()
      )
  )
);

CREATE POLICY "exercises_mutate" ON public.workout_exercises FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workout_plans wp
    WHERE wp.id = workout_plan_id
      AND (public.is_gym_staff(wp.gym_id) OR public.is_platform_super_admin())
  )
);

-- 2. Close RLS Vulnerabilities on Diet Meals
DROP POLICY IF EXISTS "meals_select" ON public.diet_meals;
DROP POLICY IF EXISTS "meals_mutate" ON public.diet_meals;

CREATE POLICY "meals_select" ON public.diet_meals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.diet_plans dp
    WHERE dp.id = diet_plan_id
      AND (
        public.is_gym_staff(dp.gym_id)
        OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = dp.member_id AND m.user_id = auth.uid())
        OR public.is_platform_super_admin()
      )
  )
);

CREATE POLICY "meals_mutate" ON public.diet_meals FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.diet_plans dp
    WHERE dp.id = diet_plan_id
      AND (public.is_gym_staff(dp.gym_id) OR public.is_platform_super_admin())
  )
);

-- 3. Close RLS Vulnerability on Audit Logs
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (actor_user_id = auth.uid() OR actor_user_id IS NULL)
);

-- 4. Server-Side GPS Attendance Verification RPC Function
-- Authoritative distance calculation and validation performed directly on database engine
CREATE OR REPLACE FUNCTION public.punch_attendance_gps(
  p_member_id UUID,
  p_user_lat NUMERIC,
  p_user_lon NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gym_id UUID;
  v_member_name VARCHAR(150);
  v_member_user_id UUID;
  v_member_status member_status;
  v_gym_lat NUMERIC;
  v_gym_lon NUMERIC;
  v_radius_meters INT;
  v_gps_enabled BOOLEAN;
  v_distance_meters INT;
  v_last_checkin TIMESTAMPTZ;
  v_minutes_since_last INT;
  v_new_record_id UUID;
  v_earth_radius NUMERIC := 6371000;
  v_dlat NUMERIC;
  v_dlon NUMERIC;
  v_a NUMERIC;
  v_c NUMERIC;
BEGIN
  -- 1. Retrieve member details
  SELECT gym_id, full_name, user_id, status
  INTO v_gym_id, v_member_name, v_member_user_id, v_member_status
  FROM public.members
  WHERE id = p_member_id;

  IF v_gym_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Member not found');
  END IF;

  -- Authoritative caller validation: caller must be the member themselves (auth.uid() = user_id) or gym staff / super admin
  IF auth.uid() IS NOT NULL AND v_member_user_id IS NOT NULL AND v_member_user_id != auth.uid()
     AND NOT public.is_gym_staff(v_gym_id) AND NOT public.is_platform_super_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Caller cannot mark attendance for this member.');
  END IF;

  -- 2. Validate membership status
  IF v_member_status != 'active' AND v_member_status != 'expiring' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Membership is ' || v_member_status || '. Please renew at front desk.');
  END IF;

  -- 3. Retrieve gym geofence settings
  SELECT latitude, longitude, geofence_radius_meters, enable_gps_attendance
  INTO v_gym_lat, v_gym_lon, v_radius_meters, v_gps_enabled
  FROM public.gym_settings
  WHERE gym_id = v_gym_id;

  IF v_gps_enabled IS FALSE THEN
    RETURN jsonb_build_object('success', false, 'message', 'GPS attendance is currently disabled by gym administration.');
  END IF;

  -- 4. Calculate Server-Side Haversine Distance
  v_dlat := radians(v_gym_lat - p_user_lat);
  v_dlon := radians(v_gym_lon - p_user_lon);
  
  v_a := sin(v_dlat / 2)^2 + cos(radians(p_user_lat)) * cos(radians(v_gym_lat)) * sin(v_dlon / 2)^2;
  -- Defensive clamp against IEEE-754 precision drift
  IF v_a > 1 THEN v_a := 1; END IF;
  IF v_a < 0 THEN v_a := 0; END IF;
  
  v_c := 2 * atan2(sqrt(v_a), sqrt(1 - v_a));
  v_distance_meters := round(v_earth_radius * v_c);

  -- 5. Validate within geofence radius
  IF v_distance_meters > v_radius_meters THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Outside gym perimeter: you are ' || v_distance_meters || 'm away (max allowed ' || v_radius_meters || 'm).',
      'distance_meters', v_distance_meters
    );
  END IF;

  -- 6. Check 60-minute anti-duplicate lockout
  SELECT check_in_time INTO v_last_checkin
  FROM public.attendance_records
  WHERE gym_id = v_gym_id AND member_id = p_member_id
  ORDER BY check_in_time DESC
  LIMIT 1;

  IF v_last_checkin IS NOT NULL THEN
    v_minutes_since_last := EXTRACT(EPOCH FROM (now() - v_last_checkin)) / 60;
    IF v_minutes_since_last < 60 THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Duplicate check-in prevented: ' || v_member_name || ' was already checked in ' || v_minutes_since_last || ' minutes ago.',
        'distance_meters', v_distance_meters
      );
    END IF;
  END IF;

  -- 7. Insert verified attendance record
  INSERT INTO public.attendance_records (
    gym_id,
    member_id,
    check_in_time,
    method,
    created_at
  ) VALUES (
    v_gym_id,
    p_member_id,
    now(),
    'gps_geofence',
    now()
  )
  RETURNING id INTO v_new_record_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Attendance verified via GPS geofence (' || v_distance_meters || 'm from front desk). Welcome, ' || v_member_name || '!',
    'distance_meters', v_distance_meters,
    'record_id', v_new_record_id
  );
END;
$$;
