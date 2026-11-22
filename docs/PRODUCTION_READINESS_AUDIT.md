# GymOS — Production Readiness & Architecture Audit

**Date:** 2026-11-22  
**Repository:** `https://github.com/sumit07122/GYM-OS`  
**Current Commit:** `3c011d2`  
**Target Environment:** Supabase (PostgreSQL 17, ap-south-1 Mumbai) + Vercel SPA  

---

## 1. Executive Summary

GymOS has been developed as a high-density, multi-tenant commercial fitness ERP for the Indian market. The core business logic, Haversine geolocation engine, anti-duplicate attendance algorithms, GST financial ledger, and responsive UI components are built and tested with 25 unit/security tests passing in Vitest.

However, transitioning to full production readiness requires addressing four critical gaps:
1. **Authentication & Session Management:** Currently using simulated `activeRole` and mock personas. Needs real Supabase Auth (Owner Signup with Gym Onboarding, Member Login, Password Reset, and secure JWT session handling).
2. **Database Connectivity & Corrective Migrations:** Existing migrations `0001`–`0005` define PostgreSQL 17 schemas, but migration `0004` contains overly permissive RLS policies on `workout_exercises` and `diet_meals` (`FOR ALL USING (true)`). These require corrective migration `0006`.
3. **Database Client Integration Layer:** Frontend currently relies primarily on the synchronous `gymStore` (localStorage/in-memory). An asynchronous Supabase service layer with offline-resilient store fallback is needed.
4. **Theme Customization:** Frontend is dark-mode only; an enterprise-grade light theme with system/device adaptation and a theme switcher is required.

---

## 2. Module Classification & Audit Matrix

| Module | Classification | Assessment & Findings | Action Required |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | **Mock/Demo Only** | `activeRole` toggle in header/sidebar allows instant switching without database authentication. No real Login/Signup forms exist in UI. | Build real `Login.tsx`, `RegisterOwner.tsx`, `ForgotPassword.tsx`, and auth guard in `router.tsx`. Remove client-side role elevation. |
| **Tenancy & Tenant Scoping** | **Partially Functional** | `gym_id` scoping is present in all schemas and store methods. RLS helpers `is_gym_staff` and `is_gym_admin` are defined. | Connect tenant context to authenticated user profile in Supabase. |
| **Owner Dashboard** | **Partially Functional** | Real metrics calculated from store (collections, dues, active members, attendance). Responsive and clean. | Wire asynchronous data fetcher to load live Supabase metrics. |
| **Member Management** | **Fully Functional (Local)** | Full CRUD, member codes (`M-00101`), profile drawer, status filters, search, CSV import preview with validation. | Sync mutations with Supabase `members` and `member_subscriptions` tables. |
| **Attendance & Geofencing** | **Fully Functional (Local)** | Haversine distance engine, 100m geofence evaluation, 60-min anti-duplicate lockout, simulator presets, live QR camera viewport. | Server-side validation via Supabase RPC function (`punch_member_attendance_gps`). |
| **Finance & POS (Ledger)** | **Fully Functional (Local)** | Consecutive invoice numbering (`OLY-2026-0001`), 18% GST (CGST 9% + SGST 9%), receipts, 1-click WhatsApp invoice link. | Sync with immutable Supabase `payments` table. |
| **Expenses Ledger** | **Fully Functional (Local)** | Categorized expenses (Rent, Electricity, Maintenance), vendor tracking, date filtering, net profit calculation. | Sync with Supabase `expenses` table. |
| **Fitness (Workouts & Diets)** | **Security Concern (RLS)** | Full workout split and Indian diet templates. **Security flaw**: Migration `0004` has `FOR ALL USING (true)` on exercises and meals! | Apply corrective migration `0006` scoping exercises/meals to parent gym via `workout_plans` / `diet_plans`. |
| **Leads CRM Pipeline** | **Fully Functional (Local)** | Kanban stages (New, Contacted, Trial Scheduled, Converted), source tracking, follow-up dates. | Sync with Supabase `leads` table. |
| **Settings & White-Label** | **Fully Functional (Local)** | Gym details, GSTIN, brand colors, geofence coordinates, Razorpay Key ID, WhatsApp phone. | Persist to Supabase `gym_settings` and `gym_branding`. |
| **Member Portal** | **Fully Functional (Local)** | Digital pass with animated QR code, GPS check-in card, assigned workouts/diets, and invoice receipts. | Restrict view strictly to `auth.uid() = members.user_id`. |
| **Theme System** | **Partially Functional** | Dark-first theme is polished, but light theme and device-adaptive switching are missing. | Implement Theme Context (`dark`, `light`, `system`) and style tokens. |

---

## 3. Dedicated Supabase Project & Infrastructure

### Current State
- The Supabase MCP currently resolves to `https://gajibrwnccddnrbnhwmh.supabase.co` (`pradeep-classes-management`, region `ap-southeast-2`).
- **Strict Non-Negotiable Rule:** MatrixGym and Pradeep Classes must NOT be modified or reused.
- Attempting programmatic creation of `gymos-saas` in `ap-south-1` via the Management API returned `403 Forbidden` because the provided Personal Access Token (`sbp_fc65...`) lacks organizational project creation permissions.

### Steps to Provision Dedicated GymOS Project in Mumbai
1. Navigate to the Supabase Dashboard: `https://app.supabase.com`.
2. Click **New Project** under your organization.
3. Configure:
   - **Name:** `gymos-saas`
   - **Database Password:** Strong 16+ character password (save securely).
   - **Region:** `ap-south-1` (Mumbai, India).
   - **Pricing Plan:** Free or Pro.
4. Once provisioned, copy the **Project URL** and **Anon Public Key** from `Project Settings > API`.
5. Populate `.env`:
   ```bash
   VITE_SUPABASE_URL=https://<new-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
6. Apply migrations `0001` through `0006` sequentially via the Supabase SQL Editor or Supabase CLI:
   ```bash
   npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   ```

---

## 4. Security Vulnerabilities Identified in Existing Migrations

### Vulnerability 1: Overly Permissive Policies on Child Fitness Tables
- **File:** `supabase/migrations/0004_trainers_workouts_diets.sql` (Lines 122-124, 130-132)
- **Code:**
  ```sql
  CREATE POLICY "exercises_mutate" ON public.workout_exercises FOR ALL USING (true);
  CREATE POLICY "meals_mutate" ON public.diet_meals FOR ALL USING (true);
  ```
- **Risk:** Any anonymous user or malicious client could delete or overwrite workout exercises and diet plans across all gyms.
- **Remediation:** In migration `0006`, drop these policies and replace them with scoped policies that verify `is_gym_staff(wp.gym_id)`.

### Vulnerability 2: Unrestricted Audit Log Insertion
- **File:** `supabase/migrations/0005_leads_notifications_saas.sql` (Line 119)
- **Code:**
  ```sql
  CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
  ```
- **Risk:** Unauthenticated users can flood or pollute the tenant audit log.
- **Remediation:** Enforce that `actor_user_id = auth.uid()` or actor is verified staff.

### Vulnerability 3: Client-Side GPS Spoofing Risk
- Currently, attendance distance is calculated in the client browser (`GpsAutoAttendanceCard.tsx`) and passed into the store.
- **Remediation:** Create a server-side PostgreSQL function `public.punch_attendance_gps(p_member_id UUID, p_user_lat NUMERIC, p_user_lon NUMERIC)` that reads the authoritative gym coordinates and radius directly from `gym_settings` and performs the Haversine calculation server-side.

---

## 5. Implementation Roadmap to Production

1. **Migration 0006**: Author `supabase/migrations/0006_security_hardening_and_rpc.sql` fixing RLS vulnerabilities and adding server-side GPS attendance verification RPC.
2. **Theme Architecture**: Implement Theme Context (`dark`, `light`, `system`) with CSS variables in `src/index.css` and a theme toggle in the UI.
3. **Authentication Pages**: Build `Login.tsx`, `RegisterOwner.tsx`, and `ForgotPassword.tsx` connected to Supabase Auth.
4. **Data Repository Layer**: Build `src/lib/supabase/repository.ts` providing full Supabase database operations with resilient store caching.
5. **UI & Route Hardening**: Protect routes with auth guards, remove demo role switcher in production, and verify all CTA buttons and modals.
6. **Testing & Audit**: Expand Vitest suite to cover security, auth, and RPC logic. Run build and verify 0 errors.
