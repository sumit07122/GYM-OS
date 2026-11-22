# GymOS — Product Requirements Document (PRD)

**Project:** GymOS  
**Product Type:** White-label Multi-Tenant Gym Management ERP SaaS  
**Market:** India (expanding globally)  
**Target Audience:** Gym Owners, General Managers, Receptionists, Personal Trainers, Gym Members, Platform Super Admins  
**Repository:** `https://github.com/sumit07122/GYM-OS`  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. Executive Summary & Vision

GymOS is a commercial-grade, multi-tenant Gym Management Enterprise Resource Planning (ERP) Software-as-a-Service (SaaS) platform tailored for the fitness industry in India. Unlike simple gym landing pages or basic attendance trackers, GymOS functions as a full-scale operating system for fitness facilities—managing memberships, biometric and QR-based attendance, multi-tiered staff and trainer commissions, financial transactions (cash, UPI, cards, net banking) with GST compliance, workout/diet prescription, customer inquiries and lead pipelines, and white-labeled member portals.

GymOS operates on a hybrid B2B SaaS revenue model:
1. **One-Time Onboarding & Setup Fee:** Covers tenant provisioning, branding configuration, initial data import, and staff onboarding.
2. **Recurring Subscription:** Monthly or annual licensing tiered by active member count, staff seats, and advanced module entitlements.

---

## 2. Core User Personas & Permissions

| Persona | Role Key | Primary Responsibilities & Access Scope |
|---|---|---|
| **Platform Super Admin** | `platform_super_admin` | Global SaaS health, gym tenant provisioning & suspension, subscription plans, MRR tracking, platform audit logs. No access to private gym member health notes unless explicitly audited. |
| **Gym Owner** | `gym_owner` | Full administrative control of their gym tenant (`gym_id`). Financial ledger, employee salaries, subscription billing, branding, audit logs, plan creation. |
| **Gym Manager** | `gym_manager` | Day-to-day operations: member registration, renewals, staff attendance, trainer allocation, lead pipeline management, expense entry. Cannot alter gym ownership or platform billing. |
| **Receptionist / Front Desk** | `receptionist` | Front-desk check-ins, manual attendance, quick member lookup, fee collection, new lead logging. Restricted from viewing gym profit/loss and salary records. |
| **Personal Trainer** | `trainer` | View assigned members, design workout regimens, prescribe diet charts, record physical measurements/progress, view personal training schedule. Zero access to gym financial ledgers or unassigned members' data. |
| **Gym Member** | `member` | Digital Gym ID with dynamic/static QR code, view membership validity, payment history & downloadable GST invoices, assigned workout/diet plans, attendance history, renewal requests. Zero access to other members' records. |

---

## 3. Detailed Functional Modules

### 3.1 Gym Onboarding & Tenant Provisioning
- **Self-Serve Registration:** Owner signs up, specifies Gym Name, Address, Indian State (for GST jurisdiction), Phone, Email, Operating Hours, and Branding (Logo, Primary Accent Color).
- **Tenant Isolation:** Generates an immutable `gym_id` (UUIDv4) and a unique URL slug (e.g., `fitzone.gymos.in` or `gymos.in/gym/fitzone`).
- **Initial Setup Automation:** Creates default membership tiers (Monthly, Quarterly, Annual), operational shifts, invoice sequence prefixes (`GYM-YYYY-0001`), and initializes a 14-day trial SaaS subscription.

### 3.2 Member Management & Lifecycle
- **Registration Profile:** Full Name, Gender, DOB, Mobile (10-digit Indian standard with `+91`), Email, Emergency Contact, Address, Blood Group, Medical Conditions/Disclaimers, Profile Photo, Assigned Trainer, Joining Date.
- **Unique Member ID:** Auto-generated structured alphanumeric identifier (e.g., `M-00248`).
- **Status Lifecycle:** `active` → `expiring` (within 7 days) → `expired` → `frozen` (medical/travel freeze) → `cancelled` / `inactive`.
- **Bulk Import/Export:** Secure CSV/Excel parsing with pre-validation preview, duplicate mobile/email checks, format validation, rollback on error, and auditable success reports. Deactivating members preserves all financial and attendance records.

### 3.3 Membership Plans & Subscriptions
- **Plan Types:** Single Duration (1, 3, 6, 12 months), Personal Training (PT) packages, Couple/Group memberships, Day passes, Student discounted plans.
- **Configurable Attributes:** Base Fee, Admission/Registration Fee, Discount rules, CGST/SGST/IGST tax inclusion/exclusion, Grace period days, Freeze policy (max freeze days, freeze fee).
- **Renewals & Transitions:** Seamless plan renewal, upgrade/downgrade calculations, partial payment carries forward to member dues ledger.

### 3.4 Attendance & Access Control
- **Dual Verification Modes:**
  1. **Dynamic QR Code Check-in:** Front-desk kiosk or mobile scan validating real-time token to prevent replay/screenshot sharing.
  2. **Manual Receptionist Override:** Single-click search-and-check-in with duplicate entry prevention (minimum interval lockout e.g., 60 minutes).
- **Check-Out Tracking:** Optional duration tracking for peak-hour density analysis.
- **Analytics:** Daily footfall graphs, peak occupancy hours (morning vs. evening rush), and automated "At-Risk / Absent" member flags (e.g., inactive for 14+ days).

### 3.5 Financial Ledger & POS (Point of Sale)
- **Two Separate Financial Spheres:**
  - **Gym Customer Finance:** Member fees, personal training packages, merchandise/supplement sales, operational expenses (rent, electricity, equipment maintenance), trainer commissions.
  - **GymOS SaaS Finance:** Gym tenant subscription fees, setup fees, add-on modules, platform invoices.
- **Payment Methods:** UPI (Google Pay, PhonePe, Paytm, BHIM), Cash, Credit/Debit Cards, NEFT/IMPS Bank Transfer.
- **Partial Payments & Dues:** Track partial down-payments, scheduled balance due dates, automated due-date alert triggers.
- **Indian Invoicing & GST Compliance:** Configurable GSTIN, HSN/SAC codes (e.g., 999723 for fitness center services), automated CGST + SGST (intra-state) or IGST (inter-state) computation, consecutive tax invoice numbers, PDF receipt generation.

### 3.6 Trainer & Staff Operations
- **Staff Profiles:** Designation, Mobile, Emergency Contact, Proof of Identity, Joining Date, Salary Structure (Fixed Monthly, Hourly PT, or Commission percentage per active PT client).
- **Shift & Attendance Management:** Clock-in / clock-out logs for gym personnel.
- **Trainer-Client Allocation:** Restrictive association ensuring trainers only see physical assessments and routines of their assigned clients.

### 3.7 Fitness Programming: Workouts & Diets
- **Exercise Library:** Categorized by muscle group (Chest, Back, Legs, Shoulders, Arms, Core, Cardio, Mobility) with equipment tags and video/GIF demonstration links.
- **Routine Builder:** Day-by-day split schedules (Push-Pull-Legs, Upper-Lower, Full Body), Sets, Reps, RPE / Target Weights, Rest timers.
- **Diet Builder:** Macronutrient targets (Protein, Carbs, Fats, Calories), Meal breakdown (Breakfast, Mid-morning, Lunch, Evening Snack, Dinner), vegetarian/non-vegetarian/vegan filtering, water intake guidelines.
- **Physical Assessments:** Weight, Body Fat %, BMI, Chest, Waist, Biceps, Thigh measurements with photo timeline comparison.

### 3.8 Inquiries, Leads & Sales CRM
- **Pipeline Stages:** `New Inquiry` → `Contacted` → `Trial Scheduled` → `Trial Attended` → `Converted (Member)` / `Lost`.
- **Lead Capture:** Lead Source (Walk-in, Instagram, Referral, Website, Google Maps), Target Fitness Goal, Budget, Assigned Staff follow-up date and remarks log.

### 3.9 Expenses & Asset Inventory
- **Expense Categorization:** Rent, Utilities (Electricity, Water), Staff Salaries, Equipment Maintenance, Marketing/Ads, Sanitation/Supplements.
- **Inventory & Assets:** Cardio equipment, Free weights, Resistance machines, Supplements for retail. Track serial numbers, maintenance schedules, warranty expiration, and stock alerts.

### 3.10 SaaS Platform Administration (Super Admin)
- **Tenant Control:** Search, inspect, activate, or suspend gym tenants.
- **Commercial MRR Engine:** Real-time recurring revenue, churn metrics, setup fee collection ledger, plan upgrade logs.
- **Feature Flagging & Quotas:** Enforce hard member limits (e.g., Starter: 150 members, Pro: 500 members, Enterprise: Unlimited), storage limits, and module access server-side.

---

## 4. Non-Functional Requirements & KPIs

- **Availability:** 99.9% uptime target hosted on Vercel Edge/Serverless with Supabase managed PostgreSQL.
- **Performance:** First Contentful Paint (FCP) < 1.2s; API roundtrips < 200ms; Database query execution < 50ms for 95% of queries.
- **Security & Isolation:** Absolute tenant data isolation verified via Row Level Security (RLS) tests; Zero cross-tenant data leakage.
- **Accessibility:** WCAG 2.1 AA compliance across all public and staff portals.
- **Localization:** Native INR (`₹`) formatting (e.g., `₹1,25,000`), DD/MM/YYYY date formatting, Indian phone number masking, and Asia/Kolkata (IST) timezone default.
