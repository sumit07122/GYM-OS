# GymOS — System Architecture & Multi-Tenant Design Document

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Architecture Style:** Multi-Tenant Modular Monolith with Supabase Managed Backend  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. Architectural Philosophy & Overview

GymOS is architected as a **multi-tenant modular monolith**. Rather than creating complex distributed microservices with heavy network overhead and consistency risks, GymOS leverages:
1. **Frontend:** React 19 / TypeScript 5 / Vite single-page application with modular feature domains, code-splitting, and route-level code boundaries.
2. **Backend & Persistence:** Supabase PostgreSQL 17 engine with strict native **Row Level Security (RLS)**, automated triggers, transactional RPCs, and PostgreSQL functions.
3. **Authentication & Identity:** Supabase Auth with custom user metadata and security-definer profile associations.
4. **Storage:** Supabase Storage with tenant-segregated bucket folders guarded by storage RLS policies.
5. **Hosting & CDN:** Vercel Edge Network with asset compression, SPA route rewrites, and security headers.

```
                       +-------------------------------------------------+
                       |             Clients / End Users                 |
                       |  (Owners, Managers, Reception, Trainers, Member)|
                       +-------------------------------------------------+
                                                |
                                      HTTPS / TLS 1.3
                                                v
                       +-------------------------------------------------+
                       |            Vercel Edge Network / CDN            |
                       |  - Vite SPA Bundle (Gzip / Brotli)              |
                       |  - Security Headers (CSP, HSTS, X-Frame)        |
                       +-------------------------------------------------+
                                                |
                         +----------------------+-----------------------+
                         |                                              |
                         v                                              v
           +---------------------------+                  +---------------------------+
           |     Supabase Auth         |                  |  Supabase REST & Realtime |
           |  - JWT Issuance           |                  |  - PostgREST Layer        |
           |  - Session Refreshing     |                  |  - WebSockets Subscriptions|
           +---------------------------+                  +---------------------------+
                         |                                              |
                         +----------------------+-----------------------+
                                                |
                                                v
                       +-------------------------------------------------+
                       |       PostgreSQL 17 Database Engine             |
                       |  +-------------------------------------------+  |
                       |  | Row Level Security (RLS) Isolation Layer  |  |
                       |  | - auth.uid() & get_active_gym_id() checks |  |
                       |  +-------------------------------------------+  |
                       |  | Relational Tables (Tenant Scoped by gym_id|  |
                       |  +-------------------------------------------+  |
                       |  | Security Definer RPCs & Audit Logging     |  |
                       |  +-------------------------------------------+  |
                       +-------------------------------------------------+
                                                |
                         +----------------------+-----------------------+
                         |                                              |
                         v                                              v
           +---------------------------+                  +---------------------------+
           |  Supabase Storage Bucket  |                  | External APIs & Webhooks  |
           |  - logos/                 |                  | - Razorpay Payment Gateway|
           |  - member-documents/     |                  | - WhatsApp Cloud API      |
           |  - avatars/               |                  | - Indian SMS Gateway      |
           +---------------------------+                  +---------------------------+
```

---

## 2. Multi-Tenant Isolation Model

GymOS implements **Shared Application, Shared Database, Logically Isolated Tenant Data**.

### 2.1 The Anchor: `gym_id`
Every tenant-specific table possesses a foreign key column:
```sql
gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT
```
Entities never exist orphaned without a `gym_id` unless they are platform-wide tables (such as `subscription_plans`, `platform_audit_logs`, and platform super-admin records).

### 2.2 Dual-Tier Authorization: Tenant Membership + Granular Roles
A single user in `auth.users` maps to:
1. `public.profiles`: Core user record (name, avatar, phone).
2. `public.gym_staff`: Links user to a specific `gym_id` with an operational role (`gym_owner`, `gym_manager`, `receptionist`, `trainer`) and custom permission flags.
3. `public.members`: Links user (when registering as a gym member) to their member record within that `gym_id`.
4. `public.platform_admins`: Identifies global platform operators.

This enables a single user account to potentially own one gym while being a paying member of another gym, without any permission cross-contamination.

### 2.3 Row Level Security (RLS) Enforcement Mechanism
To eliminate circular dependencies and ensure lightning-fast policy execution (< 2ms), authorization helper functions are marked `STABLE` and execute with `SECURITY DEFINER`:

```sql
-- Returns true if authenticated user is active staff of the specified gym
CREATE OR REPLACE FUNCTION public.is_gym_staff(p_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_staff
    WHERE gym_id = p_gym_id
      AND user_id = auth.uid()
      AND is_active = true
  );
$$;

-- Returns true if authenticated user is owner or manager of the specified gym
CREATE OR REPLACE FUNCTION public.is_gym_admin(p_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_staff
    WHERE gym_id = p_gym_id
      AND user_id = auth.uid()
      AND role IN ('gym_owner', 'gym_manager')
      AND is_active = true
  );
$$;

-- Returns true if authenticated user is a platform super administrator
CREATE OR REPLACE FUNCTION public.is_platform_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = auth.uid()
      AND is_active = true
  );
$$;
```

---

## 3. Modular Monolith Frontend Structure

The frontend application code lives under `src/`, structured strictly by operational domains:

```
src/
├── app/                      # Application Bootstrap & Configuration
│   ├── layouts/              # AuthLayout, DashboardLayout, PortalLayout, SuperAdminLayout
│   ├── providers/            # SupabaseProvider, AuthProvider, TenantProvider, ThemeProvider
│   └── router/               # React Router 7 / BrowserRouter with Route Guards
├── components/               # Design System & Shared Reusable Primitives
│   ├── forms/                # FormField, CurrencyInput, PhoneInput, DatePicker
│   ├── shared/               # MetricCard, EmptyState, ConfirmDialog, DataFilterBar
│   ├── tables/               # DataTable, TablePagination, TableColumnHeader
│   └── ui/                   # Button, Card, Dialog, Sheet, Badge, Dropdown, Tabs (shadcn/ui base)
├── hooks/                    # Reusable React Hooks (useDebounce, useMediaQuery, useToast)
├── lib/                      # Core Utilities & Infrastructure
│   ├── formatting/           # Currency (INR), Date/Time (IST), Phone masking
│   ├── permissions/          # Client-side permission gate evaluation
│   ├── supabase/             # Typed Supabase client singleton
│   ├── tenant/               # Active gym slug / gym_id resolver
│   └── validation/           # Zod schemas for forms and imports
├── modules/                  # Business Domain Modules (Self-Contained)
│   ├── attendance/           # QR scanner, check-in feed, manual check-in modal
│   ├── auth/                 # Login, Gym Registration, Forgot Password, Reset Password
│   ├── dashboard/            # KPI stats, revenue charts, member activity stream
│   ├── diets/                # Diet plan templates, calorie calculator, client assignment
│   ├── expenses/             # Expense categories, receipt upload, monthly burn breakdown
│   ├── finance/              # POS payments, pending dues, invoices, tax receipts
│   ├── inventory/            # Equipment list, supplement stock, low-stock alerts
│   ├── leads/                # Kanban sales pipeline, follow-up scheduler, inquiry logs
│   ├── members/              # Member directory, registration wizard, bulk CSV importer
│   ├── memberships/          # Membership tiers, renewal workflows, freeze policies
│   ├── notifications/        # In-app alerts, WhatsApp templates, SMS logs
│   ├── reports/              # Attendance, revenue, tax, member retention reports
│   ├── settings/             # Gym profile, branding, invoice prefix, operating hours
│   ├── staff/                # Employee directory, roles & permissions, salary ledger
│   ├── subscriptions/        # SaaS plan tier, billing invoices, upgrade modal
│   ├── super-admin/          # Platform overview, gym tenant auditor, MRR metrics
│   ├── trainers/             # Trainer profiles, assigned client rosters, schedule
│   └── workouts/             # Exercise library, routine planner, progress tracking
├── services/                 # PostgREST and RPC API service layers
└── types/                    # TypeScript interfaces and Supabase Database definitions
```

---

## 4. White-Label & Multi-Portal Routing Strategy

GymOS supports multiple portal interfaces within a single unified codebase:
1. **Public Marketing & Gym Registration:** `/` and `/register-gym`
2. **Gym Owner & Staff ERP:** `/gym/:slug/*` (e.g., `/gym/iron-paradise/dashboard`)
3. **Trainer Mobile-Optimized Portal:** `/gym/:slug/trainer/*`
4. **Member Self-Service Portal:** `/gym/:slug/member/*`
5. **Platform Super Admin Control Center:** `/super-admin/*`

### Subdomain & Domain Resolution (Production Ready)
- When deployed with wildcard DNS (`*.gymos.in`), the tenant resolver hook `useTenant()` extracts the tenant slug from either:
  1. Window hostname subdomain (`subdomain.gymos.in`)
  2. Route URL parameter (`/gym/:slug`)
  3. Custom CNAME domain mapped in `public.gym_domains`
- Once resolved, the active gym's branding configuration (Logo URL, Primary Color, Custom Accent) is dynamically applied as CSS custom variables (`--tenant-primary: #...`), providing a truly native white-label experience.

---

## 5. Security & Boundary Guardrails

1. **Defense in Depth:** Even if a malicious user bypasses frontend route guards, PostgreSQL RLS unconditionally blocks all cross-tenant database reads, inserts, updates, and deletes.
2. **Audit Trails:** Critical operations (deleting a member, applying a payment refund, overriding an attendance check-in, modifying staff roles) trigger synchronous writes to `public.audit_logs`.
3. **No Direct Overwriting of Financial Records:** Payments and refunds are recorded as immutable transaction entries. Adjustments require explicit credit/debit notes.
4. **Protected Storage Buckets:** Private documents (medical certificates, identity proofs) are placed in authenticated storage folders guarded by tenant authorization policies.
