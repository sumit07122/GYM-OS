# GymOS — Development Roadmap & Milestone Architecture

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Target Market:** India  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## Roadmap Overview

```
Phase 0: Discovery & Architecture (Current)
   │
   ▼
Phase 1: Multi-Tenant Foundation, Auth & Tenant Provisioning
   │
   ▼
Phase 2: Core Gym ERP (Members, Plans, Attendance, QR, Payments)
   │
   ▼
Phase 3: Advanced Operations (Trainers, Workouts, Diets, Leads, Expenses)
   │
   ▼
Phase 4: Automation & Communication (WhatsApp Cloud, In-App Alerts, Expiry Alarms)
   │
   ▼
Phase 5: SaaS Super Admin & Commercial Engine (MRR, Plans, Quotas, Audit)
   │
   ▼
Phase 6: Razorpay Payments, White-Label Production & Go-To-Market
```

---

## Phase Breakdown

### Phase 0: Discovery & Architecture (In Progress)
- **Deliverables:**
  - Environment, Git repository, and skills audit
  - Complete Product Requirements Document (`docs/PRD.md`)
  - System Architecture & Modular Monolith Guide (`docs/ARCHITECTURE.md`)
  - Relational Database Schema (`docs/DATABASE_SCHEMA.md`)
  - Role & Permission Matrix (`docs/ROLE_PERMISSION_MATRIX.md`)
  - Security & Multi-Tenant Model (`docs/SECURITY_MODEL.md`)
  - Comprehensive Design System (`design-system/MASTER.md`, `tokens.json`, `components.md`, page specs)
- **Exit Criteria:** Architecture approved, clean Git repo initialized.

### Phase 1: Core Foundation & Tenant Provisioning
- **Deliverables:**
  - Vite + React 19 + TypeScript + Tailwind CSS project scaffolding
  - Supabase client integration & authentication flow (Email/Password, Session recovery)
  - Database Migration 0001: Core profiles, gyms, gym_settings, gym_branding, gym_staff, RLS helpers
  - Tenant Onboarding Wizard: Register gym, auto-generate slug, assign owner role
  - Dark-first layout shell: Sidebar, Header, Breadcrumbs, Tenant Switcher / Indicator
  - Role-based route guard system
- **Exit Criteria:** User can register, create a gym tenant, be granted `gym_owner` role, and access a live tenant dashboard isolated by RLS.

### Phase 2: Core Gym ERP (Members, Plans, Attendance & Payments)
- **Deliverables:**
  - Database Migration 0002: Members, membership_plans, member_subscriptions, attendance_records, payments
  - Member Directory: Search, multi-criteria filters, member profile drawer
  - Bulk CSV/Excel Member Importer with preview & validation
  - Membership Plans Manager: Duration, price, admission fee, tax calculation
  - Dual Attendance Engine: Dynamic QR scanner kiosk & manual receptionist check-in
  - Payment Collection & Invoicing: Cash/UPI/Card recording, partial payment dues, PDF receipt generation
  - Member Self-Service Portal: Digital Gym ID card with QR, active plan countdown, receipts
- **Exit Criteria:** Complete member lifecycle operational; attendance duplicate prevention verified; payments generate consecutive invoices with Indian formatting.

### Phase 3: Advanced Gym Operations
- **Deliverables:**
  - Database Migration 0003: Trainers, workouts, diets, measurements, leads, expenses, inventory
  - Trainer Portal: Assigned client roster, routine prescription, progress notes
  - Exercise & Routine Builder: Muscle group filtering, sets/reps/rest timers
  - Diet & Nutrition Planner: Caloric targets, macronutrients, meal splits
  - Sales CRM Pipeline: Kanban lead board, follow-up scheduler, conversion tracking
  - Operational Expenses Ledger: Categories, vendor tracking, monthly burn chart
- **Exit Criteria:** Trainers restricted strictly to assigned clients; financial P&L reflects revenues minus expenses accurately.

### Phase 4: Automation & Indian Integrations
- **Deliverables:**
  - Database Migration 0004: Notifications, templates, delivery logs
  - Centralized notification dispatcher: In-app alerts + webhook architecture
  - Automated alert triggers: Expiry warnings (7 days, 3 days, today), payment dues, birthday wishes, absent member reminders (14+ days)
  - WhatsApp Business Cloud API integration architecture (server-side secure proxy)
- **Exit Criteria:** Notification triggers dispatch without duplication; failed webhooks are logged and retryable.

### Phase 5: SaaS Super Admin & Commercial Engine
- **Deliverables:**
  - Database Migration 0005: Platform admins, subscription plans, gym subscriptions, platform audit logs
  - Super Admin Dashboard: Total gyms, active vs trial vs suspended, MRR analytics, plan distribution
  - Tenant Lifecycle Management: One-click suspension, reactivation, audit inspection
  - Plan Enforceability: Hard server-side quota checks on max members and staff seats
- **Exit Criteria:** Super Admin portal fully functional; tenant quota limits enforced on server.

### Phase 6: Razorpay Payments, White-Labeling & Production Launch
- **Deliverables:**
  - Razorpay Gateway integration for gym membership fee collection & SaaS subscription checkout
  - Webhook signature verification & idempotent transaction recording
  - White-label domain resolution: Subdomain / custom CNAME support
  - Progressive Web App (PWA) manifest & offline service worker for kiosks
  - Comprehensive E2E test suites (Vitest, Playwright) & security penetration tests
  - Production deployment to Vercel with security headers and automated CI/CD
- **Exit Criteria:** 100% automated test pass rate; zero cross-tenant RLS vulnerabilities; production build deployed and verified.
