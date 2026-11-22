# GymOS — Relational Database Schema Specification

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Target Engine:** PostgreSQL 17 (Supabase Managed)  
**Schema Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. Schema Conventions & System Types

### 1.1 Global Enums & Custom Domain Types

```sql
-- Operational roles within a gym tenant
CREATE TYPE gym_role AS ENUM (
  'gym_owner',
  'gym_manager',
  'receptionist',
  'trainer'
);

-- Member status lifecycle
CREATE TYPE member_status AS ENUM (
  'active',
  'expiring',
  'expired',
  'frozen',
  'inactive'
);

-- Payment transaction methods in the Indian market
CREATE TYPE payment_method AS ENUM (
  'cash',
  'upi',
  'card',
  'bank_transfer',
  'cheque',
  'other'
);

-- Payment classification
CREATE TYPE payment_type AS ENUM (
  'membership_fee',
  'registration_fee',
  'personal_training',
  'merchandise',
  'supplement',
  'locker_fee',
  'renewal',
  'penalty_fee'
);

-- Attendance check-in method
CREATE TYPE attendance_method AS ENUM (
  'qr_scan',
  'reception_manual',
  'biometric',
  'mobile_app'
);

-- Lead sales pipeline status
CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'trial_scheduled',
  'trial_attended',
  'converted',
  'lost'
);

-- SaaS billing intervals
CREATE TYPE billing_interval AS ENUM (
  'monthly',
  'yearly',
  'one_time'
);

-- SaaS tenant subscription status
CREATE TYPE saas_subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'suspended',
  'cancelled'
);
```

---

## 2. Platform & Multi-Tenant Core Tables

### 2.1 `public.profiles`
Stores universal user identity attributes linked 1-to-1 with Supabase `auth.users`.
- `id` UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- `full_name` VARCHAR(150) NOT NULL
- `phone` VARCHAR(20) UNIQUE
- `avatar_url` TEXT
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 2.2 `public.platform_admins`
Designates users with global SaaS administration access.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE
- `granted_by` UUID REFERENCES public.profiles(id)
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 2.3 `public.gyms`
The central tenant entity representing each gym business.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `name` VARCHAR(200) NOT NULL
- `slug` VARCHAR(80) NOT NULL UNIQUE
- `legal_business_name` VARCHAR(200)
- `gstin` VARCHAR(15) -- Indian 15-character GST Identification Number
- `phone` VARCHAR(20) NOT NULL
- `email` VARCHAR(150) NOT NULL
- `address_line1` TEXT NOT NULL
- `address_line2` TEXT
- `city` VARCHAR(100) NOT NULL
- `state` VARCHAR(100) NOT NULL -- For CGST/SGST vs IGST calculation
- `pincode` VARCHAR(10) NOT NULL
- `country` VARCHAR(50) NOT NULL DEFAULT 'India'
- `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata'
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 2.4 `public.gym_settings`
Tenant-level configuration parameters.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE CASCADE
- `invoice_prefix` VARCHAR(10) NOT NULL DEFAULT 'INV'
- `invoice_next_number` INT NOT NULL DEFAULT 1
- `currency` VARCHAR(10) NOT NULL DEFAULT 'INR'
- `tax_rate_percent` NUMERIC(5,2) NOT NULL DEFAULT 18.00 -- Standard Indian Fitness GST rate
- `is_tax_inclusive` BOOLEAN NOT NULL DEFAULT false
- `attendance_qr_refresh_seconds` INT NOT NULL DEFAULT 60
- `allow_member_portal_renewals` BOOLEAN NOT NULL DEFAULT true
- `max_freeze_days_per_year` INT NOT NULL DEFAULT 30
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 2.5 `public.gym_branding`
White-label customization details.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE CASCADE
- `logo_url` TEXT
- `primary_color` VARCHAR(20) NOT NULL DEFAULT '#10B981' -- Electric emerald
- `accent_color` VARCHAR(20) NOT NULL DEFAULT '#047857'
- `tagline` VARCHAR(255)
- `website_url` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 2.6 `public.subscription_plans` (GymOS SaaS Tiers)
Platform plans offered to gym owners.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `name` VARCHAR(100) NOT NULL -- e.g., 'Starter', 'Professional', 'Enterprise'
- `slug` VARCHAR(50) NOT NULL UNIQUE
- `setup_fee` NUMERIC(10,2) NOT NULL DEFAULT 0.00
- `price_monthly` NUMERIC(10,2) NOT NULL
- `price_yearly` NUMERIC(10,2) NOT NULL
- `max_members` INT NOT NULL -- Hard entitlement limit (-1 for unlimited)
- `max_staff` INT NOT NULL
- `features` JSONB NOT NULL DEFAULT '[]'::jsonb
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 2.7 `public.gym_subscriptions` (Tenant SaaS Subscriptions)
Tracks each gym's recurring billing status with GymOS platform.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE RESTRICT
- `plan_id` UUID NOT NULL REFERENCES public.subscription_plans(id)
- `status` saas_subscription_status NOT NULL DEFAULT 'trialing'
- `billing_interval` billing_interval NOT NULL DEFAULT 'monthly'
- `trial_ends_at` TIMESTAMPTZ
- `current_period_start` TIMESTAMPTZ NOT NULL DEFAULT now()
- `current_period_end` TIMESTAMPTZ NOT NULL
- `setup_fee_paid` BOOLEAN NOT NULL DEFAULT false
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

---

## 3. Gym Staff, Trainers & Members

### 3.1 `public.gym_staff`
Staff members assigned to a gym with role-based access.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `user_id` UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
- `role` gym_role NOT NULL
- `custom_permissions` JSONB DEFAULT '[]'::jsonb
- `salary_monthly` NUMERIC(10,2) DEFAULT 0.00
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `joined_at` DATE NOT NULL DEFAULT CURRENT_DATE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now(),
- UNIQUE(gym_id, user_id)

### 3.2 `public.trainers`
Extended professional details for fitness trainers.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `staff_id` UUID NOT NULL UNIQUE REFERENCES public.gym_staff(id) ON DELETE CASCADE
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `specialization` TEXT[] DEFAULT '{}',
- `pt_commission_percent` NUMERIC(5,2) DEFAULT 0.00
- `bio` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 3.3 `public.members`
Gym client records.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `user_id` UUID REFERENCES public.profiles(id) ON DELETE SET NULL -- Populated if member signs up for portal
- `member_code` VARCHAR(50) NOT NULL -- e.g., 'M-00104'
- `full_name` VARCHAR(150) NOT NULL
- `email` VARCHAR(150)
- `phone` VARCHAR(20) NOT NULL
- `gender` VARCHAR(20)
- `date_of_birth` DATE
- `blood_group` VARCHAR(10)
- `emergency_contact_name` VARCHAR(150)
- `emergency_contact_phone` VARCHAR(20)
- `address` TEXT
- `medical_conditions` TEXT
- `profile_photo_url` TEXT
- `assigned_trainer_id` UUID REFERENCES public.trainers(id) ON DELETE SET NULL
- `status` member_status NOT NULL DEFAULT 'active'
- `joining_date` DATE NOT NULL DEFAULT CURRENT_DATE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now(),
- UNIQUE(gym_id, member_code)

---

## 4. Memberships, Attendance & Finance

### 4.1 `public.membership_plans`
Packages offered by the gym to members.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `name` VARCHAR(100) NOT NULL -- e.g., '12 Months Gold Elite'
- `duration_days` INT NOT NULL -- e.g., 30, 90, 180, 365
- `price` NUMERIC(10,2) NOT NULL
- `admission_fee` NUMERIC(10,2) NOT NULL DEFAULT 0.00
- `is_pt_included` BOOLEAN NOT NULL DEFAULT false
- `pt_sessions_count` INT DEFAULT 0
- `description` TEXT
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now(),
- UNIQUE(gym_id, name)

### 4.2 `public.member_subscriptions`
Active and historical member subscriptions.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `member_id` UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE
- `plan_id` UUID NOT NULL REFERENCES public.membership_plans(id)
- `start_date` DATE NOT NULL
- `end_date` DATE NOT NULL
- `is_frozen` BOOLEAN NOT NULL DEFAULT false
- `freeze_start_date` DATE
- `freeze_end_date` DATE
- `status` member_status NOT NULL DEFAULT 'active'
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 4.3 `public.attendance_records`
Daily check-in and check-out logs.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `member_id` UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE
- `check_in_time` TIMESTAMPTZ NOT NULL DEFAULT now()
- `check_out_time` TIMESTAMPTZ
- `method` attendance_method NOT NULL DEFAULT 'reception_manual'
- `verified_by_staff_id` UUID REFERENCES public.gym_staff(id)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 4.4 `public.payments`
Immutable financial transactions ledger.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `member_id` UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT
- `subscription_id` UUID REFERENCES public.member_subscriptions(id) ON DELETE SET NULL
- `invoice_number` VARCHAR(50) NOT NULL
- `payment_type` payment_type NOT NULL DEFAULT 'membership_fee'
- `payment_method` payment_method NOT NULL DEFAULT 'cash'
- `amount_paid` NUMERIC(10,2) NOT NULL
- `tax_amount` NUMERIC(10,2) NOT NULL DEFAULT 0.00
- `discount_amount` NUMERIC(10,2) NOT NULL DEFAULT 0.00
- `balance_due` NUMERIC(10,2) NOT NULL DEFAULT 0.00
- `due_date` DATE
- `transaction_reference` VARCHAR(100) -- e.g., UPI UTR or Bank Cheque #
- `notes` TEXT
- `created_by_staff_id` UUID REFERENCES public.gym_staff(id)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now(),
- UNIQUE(gym_id, invoice_number)

### 4.5 `public.expenses`
Gym operational expenditures.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `gym_id` UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
- `category` VARCHAR(100) NOT NULL -- Rent, Utilities, Maintenance, Salary, Marketing
- `amount` NUMERIC(10,2) NOT NULL
- `payment_method` payment_method NOT NULL DEFAULT 'bank_transfer'
- `date` DATE NOT NULL DEFAULT CURRENT_DATE
- `vendor_name` VARCHAR(150)
- `receipt_url` TEXT
- `notes` TEXT
- `recorded_by_staff_id` UUID REFERENCES public.gym_staff(id)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

---

## 5. Fitness, Leads & Governance Tables

- `public.workout_plans`: Split routines, goal tags, assigned member.
- `public.workout_exercises`: Exercises inside routine with sets, reps, weight, rest timer.
- `public.diet_plans`: Macro goals, calorie limits, meal schedules.
- `public.member_measurements`: Periodic biometric assessments (weight, body fat %, circumferences).
- `public.leads`: Sales prospects with stage tracking (`lead_status`), source, and follow-up alerts.
- `public.audit_logs`: Tenant-scoped immutable log recording `action`, `entity_type`, `entity_id`, `actor_user_id`, and `changes` JSONB.

---

## 6. Critical Indexes for High-Velocity Queries

```sql
CREATE INDEX idx_members_gym_status ON public.members(gym_id, status);
CREATE INDEX idx_members_gym_phone ON public.members(gym_id, phone);
CREATE INDEX idx_subscriptions_member_dates ON public.member_subscriptions(member_id, start_date, end_date);
CREATE INDEX idx_attendance_gym_checkin ON public.attendance_records(gym_id, check_in_time DESC);
CREATE INDEX idx_payments_gym_created ON public.payments(gym_id, created_at DESC);
CREATE INDEX idx_leads_gym_status ON public.leads(gym_id, status);
CREATE INDEX idx_audit_logs_gym_created ON public.audit_logs(gym_id, created_at DESC);
```
