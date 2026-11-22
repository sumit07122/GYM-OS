-- Migration 0003: Financial Ledger, POS Payments, Taxes, Invoices, and Expenses
-- Engine: PostgreSQL 17

CREATE TYPE payment_method AS ENUM (
  'cash',
  'upi',
  'card',
  'bank_transfer',
  'cheque',
  'other'
);

CREATE TYPE payment_type AS ENUM (
  'membership_fee',
  'registration_fee',
  'personal_training',
  'merchandise',
  'supplement',
  'locker_fee',
  'renewal',
  'penalty_fee',
  'refund'
);

-- 1. Payments Table (Immutable Financial Ledger)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES public.member_subscriptions(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  payment_type payment_type NOT NULL DEFAULT 'membership_fee',
  payment_method payment_method NOT NULL DEFAULT 'cash',
  amount_paid NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  balance_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  due_date DATE,
  transaction_reference VARCHAR(100), -- UPI UTR or Bank Cheque Number
  notes TEXT,
  created_by_staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, invoice_number)
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  category VARCHAR(100) NOT NULL, -- Rent, Utilities, Maintenance, Salary, Marketing
  amount NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_name VARCHAR(150),
  receipt_url TEXT,
  notes TEXT,
  recorded_by_staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Payments Policies
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (
  public.is_gym_staff(gym_id) OR EXISTS (SELECT 1 FROM public.members WHERE id = member_id AND user_id = auth.uid()) OR public.is_platform_super_admin()
);

CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_platform_super_admin()
);

-- Note: No UPDATE or DELETE policy on payments to preserve financial immutability!

-- Expenses Policies
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT USING (
  public.is_gym_admin(gym_id) OR public.is_platform_super_admin()
);

CREATE POLICY "expenses_mutate" ON public.expenses FOR ALL USING (
  public.is_gym_admin(gym_id) OR public.is_platform_super_admin()
);
