-- Migration 0005: Leads CRM, Notifications, SaaS Subscription Plans, and Audit Logs
-- Engine: PostgreSQL 17

CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'trial_scheduled',
  'trial_attended',
  'converted',
  'lost'
);

-- 1. Leads Table (Sales CRM Pipeline)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  source VARCHAR(50) DEFAULT 'Walk-in', -- Walk-in, Instagram, Referral, Google, Website
  interested_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  status lead_status NOT NULL DEFAULT 'new',
  follow_up_date DATE,
  assigned_staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- expiry, payment_due, birthday, announcement, attendance
  channel VARCHAR(20) NOT NULL DEFAULT 'in_app', -- in_app, whatsapp, email, sms
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SaaS Subscription Plans (Platform Tier)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  setup_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2) NOT NULL,
  max_members INT NOT NULL DEFAULT 200, -- -1 for unlimited
  max_staff INT NOT NULL DEFAULT 5,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Default SaaS Plans
INSERT INTO public.subscription_plans (name, slug, setup_fee, price_monthly, price_yearly, max_members, max_staff, features)
VALUES 
  ('Starter', 'starter', 2999.00, 499.00, 4990.00, 150, 3, '["members", "attendance", "pos_cash", "in_app_notifications"]'::jsonb),
  ('Professional', 'professional', 5999.00, 999.00, 9990.00, 500, 10, '["members", "attendance", "pos_all", "trainers", "workouts", "diets", "leads_crm", "whatsapp_alerts"]'::jsonb),
  ('Enterprise', 'enterprise', 9999.00, 1999.00, 19990.00, -1, 50, '["unlimited_members", "multi_branch", "custom_branding", "advanced_analytics", "priority_support", "automated_reconciliation"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- 4. Gym Subscriptions Table
CREATE TABLE IF NOT EXISTS public.gym_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status saas_subscription_status NOT NULL DEFAULT 'trialing',
  billing_interval billing_interval NOT NULL DEFAULT 'monthly',
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  setup_fee_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tenant Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- member.create, payment.collect, plan.update, attendance.override
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "leads_select" ON public.leads FOR SELECT USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());
CREATE POLICY "leads_mutate" ON public.leads FOR ALL USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (
  user_id = auth.uid() OR public.is_gym_staff(gym_id) OR public.is_platform_super_admin()
);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "subscription_plans_select" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "subscription_plans_mutate" ON public.subscription_plans FOR ALL USING (public.is_platform_super_admin());

CREATE POLICY "gym_subscriptions_select" ON public.gym_subscriptions FOR SELECT USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());
CREATE POLICY "gym_subscriptions_mutate" ON public.gym_subscriptions FOR ALL USING (public.is_platform_super_admin());

CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
