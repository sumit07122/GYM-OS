# GymOS Page Specification — Member Management

**Page Route:** `/gym/:slug/members`  
**Access Roles:** `gym_owner`, `gym_manager`, `receptionist`  

---

## 1. Top Control Bar
- **Page Title:** "Member Directory" (`text-xl font-bold text-slate-100`).
- **Subtext:** "Manage member profiles, active subscriptions, and biometric data."
- **Actions:**
  - `Bulk Import`: Opens CSV/Excel importer modal with preview.
  - `Export CSV`: Exports filtered list (respecting permission limits).
  - `+ Add Member`: Primary CTA launching registration drawer.

## 2. Filter & Search Toolbar
- **Search Input:** Debounced text search matching Member Name, Code (`M-001`), Phone, or Email.
- **Status Filter Tabs:** All (`512`) | Active (`482`) | Expiring Soon (`24`) | Expired (`18`) | Frozen (`6`).
- **Plan Filter Dropdown:** All Plans, Annual Elite, 6 Months, Monthly, PT Only.
- **Trainer Filter:** Filter by assigned personal trainer.

## 3. Data Table Layout
Columns:
1. Member (`Avatar + Full Name + Member Code`).
2. Contact (`Phone + Email`).
3. Active Plan (`Plan Name + End Date Badge`).
4. Status (`Active (Green), Expiring (Amber), Expired (Red)`).
5. Due Balance (`₹0.00` or `₹2,500 Due`).
6. Assigned Trainer (`Trainer Name or Unassigned`).
7. Actions (`View Profile`, `Renew Plan`, `Collect Payment`, `More Options Dropdown`).

## 4. Member Profile Slide-over Drawer
- Comprehensive tabbed drawer:
  - Tab 1: Personal & Emergency Details + Medical Notes.
  - Tab 2: Subscription History & Renewals.
  - Tab 3: Payment Ledger & Tax Receipts.
  - Tab 4: Attendance History (Calendar View).
  - Tab 5: Assigned Workout & Diet Regimen.
