# GymOS — Commercial Multi-Tenant Gym Management ERP SaaS

GymOS is a commercial-grade, white-label Multi-Tenant Gym Management ERP SaaS engineered specifically for the Indian fitness industry.

## Key Capabilities
- **Operational Roles:** Streamlined architecture strictly isolating **Gym Owner** (full ERP administrative suite) and **Member** (self-service pass, workout/diet routines, payments).
- **Authoritative Attendance:** Dynamic turnstile QR code scanner + server-side GPS geofence auto-attendance verified via PostgreSQL RPC `punch_attendance_gps`.
- **Indian Financial POS:** Consecutive GST tax invoice generation (CGST 9% + SGST 9%), outstanding balance tracking, and 1-click WhatsApp payment receipts.
- **Dual-Theme Engine:** Dark-first interface, elegant clean white/light theme, and automatic device/OS system adaptation with a 1-click switcher.
- **Mobile First & Responsive:** Tested across desktop (1440px), laptop (1280px), tablet (768px), and mobile (390px) with touch-friendly navigation drawer.

---

## Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Date-fns
- **Backend & Database:** Supabase (PostgreSQL 17, Row Level Security, Auth, Storage, Stored Procedures)
- **Deployment:** Vercel (SPA rewrite rules in `vercel.json`)
- **Payments:** Razorpay UPI / Cards integration support
- **Communications:** WhatsApp Business Cloud API deep links

---

## Getting Started

### 1. Installation
```bash
git clone https://github.com/sumit07122/GYM-OS.git
cd GYM-OS
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your dedicated Supabase project URL and public Anon key in `.env`:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` to launch the application.

### 4. Run Test Suite
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
```

---

## Dedicated Mumbai (`ap-south-1`) Database Migrations
All migrations are located in `supabase/migrations/`:
- `0001_initial_schema.sql`
- `0002_plans_and_subscriptions.sql`
- `0003_fix_recursive_rls.sql`
- `0004_workouts_and_diets.sql`
- `0005_rls_policies.sql`
- `0006_security_hardening_and_rpc.sql` (Authoritative server-side GPS Haversine verification)

Push to your dedicated Supabase instance:
```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

---

## Architectural Documentation
- [Final Production Readiness Report](./docs/FINAL_PRODUCTION_READINESS_REPORT.md)
- [Production Readiness Audit](./docs/PRODUCTION_READINESS_AUDIT.md)
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [System Architecture & Multi-Tenancy](./docs/ARCHITECTURE.md)
- [Relational Database Schema](./docs/DATABASE_SCHEMA.md)
- [Role & Permission Matrix (RBAC)](./docs/ROLE_PERMISSION_MATRIX.md)
- [Design System Master Guide](./design-system/MASTER.md)
