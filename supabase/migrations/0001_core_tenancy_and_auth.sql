-- Migration 0001: Core Tenancy, Profiles, Gyms, Branding, Staff, and RLS Helpers
-- Engine: PostgreSQL 17

-- 1. Create System Enums
CREATE TYPE gym_role AS ENUM (
  'gym_owner',
  'gym_manager',
  'receptionist',
  'trainer'
);

CREATE TYPE billing_interval AS ENUM (
  'monthly',
  'yearly',
  'one_time'
);

CREATE TYPE saas_subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'suspended',
  'cancelled'
);

-- 2. Profiles Table (1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Platform Super Admins
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Gyms (Tenant Table)
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  legal_business_name VARCHAR(200),
  gstin VARCHAR(15),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  country VARCHAR(50) NOT NULL DEFAULT 'India',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Gym Settings
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE CASCADE,
  invoice_prefix VARCHAR(10) NOT NULL DEFAULT 'INV',
  invoice_next_number INT NOT NULL DEFAULT 1,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  tax_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  is_tax_inclusive BOOLEAN NOT NULL DEFAULT false,
  attendance_qr_refresh_seconds INT NOT NULL DEFAULT 60,
  allow_member_portal_renewals BOOLEAN NOT NULL DEFAULT true,
  max_freeze_days_per_year INT NOT NULL DEFAULT 30,
  -- Geofence Configuration
  latitude NUMERIC(9,6) NOT NULL DEFAULT 19.059600,
  longitude NUMERIC(9,6) NOT NULL DEFAULT 72.829500,
  geofence_radius_meters INT NOT NULL DEFAULT 100,
  enable_gps_attendance BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Gym Branding
CREATE TABLE IF NOT EXISTS public.gym_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color VARCHAR(20) NOT NULL DEFAULT '#10B981',
  accent_color VARCHAR(20) NOT NULL DEFAULT '#059669',
  tagline VARCHAR(255),
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Gym Staff
CREATE TABLE IF NOT EXISTS public.gym_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role gym_role NOT NULL,
  custom_permissions JSONB DEFAULT '[]'::jsonb,
  salary_monthly NUMERIC(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, user_id)
);

-- 8. RLS Security Definer Helper Functions
CREATE OR REPLACE FUNCTION public.is_gym_staff(p_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_staff
    WHERE gym_id = p_gym_id
      AND user_id = auth.uid()
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_gym_admin(p_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_staff
    WHERE gym_id = p_gym_id
      AND user_id = auth.uid()
      AND role IN ('gym_owner', 'gym_manager')
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = auth.uid()
      AND is_active = true
  );
$$;

-- 9. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_platform_super_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "gyms_select" ON public.gyms FOR SELECT USING (
  is_active = true OR public.is_gym_staff(id) OR public.is_platform_super_admin()
);
CREATE POLICY "gyms_update" ON public.gyms FOR UPDATE USING (
  public.is_gym_admin(id) OR public.is_platform_super_admin()
);

CREATE POLICY "gym_settings_select" ON public.gym_settings FOR SELECT USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());
CREATE POLICY "gym_settings_update" ON public.gym_settings FOR UPDATE USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "gym_branding_select" ON public.gym_branding FOR SELECT USING (true); -- Publicly viewable for tenant portals
CREATE POLICY "gym_branding_update" ON public.gym_branding FOR UPDATE USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "gym_staff_select" ON public.gym_staff FOR SELECT USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());
CREATE POLICY "gym_staff_mutate" ON public.gym_staff FOR ALL USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());
