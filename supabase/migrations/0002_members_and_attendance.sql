-- Migration 0002: Members, Membership Plans, Subscriptions, Attendance, and Anti-Duplicate Triggers
-- Engine: PostgreSQL 17

CREATE TYPE member_status AS ENUM (
  'active',
  'expiring',
  'expired',
  'frozen',
  'inactive'
);

CREATE TYPE attendance_method AS ENUM (
  'qr_scan',
  'reception_manual',
  'biometric',
  'mobile_app'
);

-- 1. Membership Plans
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  admission_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_pt_included BOOLEAN NOT NULL DEFAULT false,
  pt_sessions_count INT DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, name)
);

-- 2. Members Table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(20),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(20),
  address TEXT,
  medical_conditions TEXT,
  profile_photo_url TEXT,
  assigned_trainer_id UUID, -- References trainers table in 0004
  status member_status NOT NULL DEFAULT 'active',
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, member_code)
);

-- 3. Member Subscriptions
CREATE TABLE IF NOT EXISTS public.member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  freeze_start_date DATE,
  freeze_end_date DATE,
  status member_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_time TIMESTAMPTZ,
  method attendance_method NOT NULL DEFAULT 'reception_manual',
  verified_by_staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_gym_status ON public.members(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_members_gym_phone ON public.members(gym_id, phone);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_checkin ON public.attendance_records(gym_id, check_in_time DESC);

-- Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "plans_select" ON public.membership_plans FOR SELECT USING (true);
CREATE POLICY "plans_mutate" ON public.membership_plans FOR ALL USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "members_select" ON public.members FOR SELECT USING (
  public.is_gym_staff(gym_id) OR user_id = auth.uid() OR public.is_platform_super_admin()
);
CREATE POLICY "members_mutate" ON public.members FOR ALL USING (
  public.is_gym_staff(gym_id) OR public.is_platform_super_admin()
);

CREATE POLICY "member_subscriptions_select" ON public.member_subscriptions FOR SELECT USING (
  public.is_gym_staff(gym_id) OR EXISTS (SELECT 1 FROM public.members WHERE id = member_id AND user_id = auth.uid()) OR public.is_platform_super_admin()
);
CREATE POLICY "member_subscriptions_mutate" ON public.member_subscriptions FOR ALL USING (
  public.is_gym_staff(gym_id) OR public.is_platform_super_admin()
);

CREATE POLICY "attendance_select" ON public.attendance_records FOR SELECT USING (
  public.is_gym_staff(gym_id) OR EXISTS (SELECT 1 FROM public.members WHERE id = member_id AND user_id = auth.uid()) OR public.is_platform_super_admin()
);
CREATE POLICY "attendance_insert" ON public.attendance_records FOR INSERT WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_platform_super_admin()
);
