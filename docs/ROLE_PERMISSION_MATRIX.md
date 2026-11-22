# GymOS — Role & Permission Matrix (RBAC)

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. System Roles Overview

GymOS defines 6 discrete roles partitioned into three tiers:

1. **Platform Tier:**
   - `platform_super_admin`: Oversees the entire SaaS platform, all gym tenants, billing, feature flags, and global compliance.
2. **Tenant Operations Tier:**
   - `gym_owner`: The business owner who purchased GymOS for their facility. Holds total authority over tenant configuration, finances, and staff.
   - `gym_manager`: General operational manager handling daily member onboarding, renewals, staff assignments, and general expenses.
   - `receptionist`: Front-desk representative focused on visitor registration, member check-ins, fee collections, and lead logging.
   - `trainer`: Fitness professional managing assigned workout and diet regimens, client progress, and personal training schedules.
3. **End-User Tier:**
   - `member`: The gym client accessing their personal digital gym pass, routine, diet, and payment receipts.

---

## 2. Granular Permissions Matrix

| Permission Key | Description | Super Admin | Gym Owner | Gym Manager | Receptionist | Trainer | Member |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Platform Management** |
| `platform.tenants.view` | View all platform gym tenants | **YES** | NO | NO | NO | NO | NO |
| `platform.tenants.create` | Provision new gym tenant | **YES** | NO | NO | NO | NO | NO |
| `platform.tenants.suspend` | Suspend / activate tenant | **YES** | NO | NO | NO | NO | NO |
| `platform.plans.manage` | Create/edit SaaS billing tiers | **YES** | NO | NO | NO | NO | NO |
| `platform.revenue.view` | View platform MRR & SaaS billing | **YES** | NO | NO | NO | NO | NO |
| **Gym Settings & Branding** |
| `settings.gym.view` | View gym profile & operating hours | **YES** | **YES** | **YES** | **YES** | NO | NO |
| `settings.gym.edit` | Update gym address, hours, tax info | NO | **YES** | NO | NO | NO | NO |
| `settings.branding.manage` | Update logo, brand colors, slug | NO | **YES** | NO | NO | NO | NO |
| `settings.subscription.manage` | Manage SaaS subscription & pay | NO | **YES** | NO | NO | NO | NO |
| **Member Management** |
| `members.view` | View member directory & profiles | NO | **YES** | **YES** | **YES** | Assigned | Self |
| `members.create` | Register new member | NO | **YES** | **YES** | **YES** | NO | NO |
| `members.update` | Edit member details | NO | **YES** | **YES** | **YES** | NO | Self (Ltd) |
| `members.deactivate` | Deactivate / freeze member | NO | **YES** | **YES** | NO | NO | NO |
| `members.import_export` | Bulk CSV import or data export | NO | **YES** | **YES** | NO | NO | NO |
| `members.health_notes.view` | View medical/health disclaimers | NO | **YES** | **YES** | NO | Assigned | Self |
| **Memberships & Plans** |
| `plans.manage` | Create/edit gym membership plans | NO | **YES** | **YES** | NO | NO | NO |
| `plans.view` | View active gym membership plans | NO | **YES** | **YES** | **YES** | **YES** | **YES** |
| `subscriptions.renew` | Renew / extend member plan | NO | **YES** | **YES** | **YES** | NO | Request |
| `subscriptions.freeze` | Apply temporary freeze on plan | NO | **YES** | **YES** | NO | NO | Request |
| **Attendance & Access** |
| `attendance.view` | View attendance feed & reports | NO | **YES** | **YES** | **YES** | Assigned | Self |
| `attendance.check_in` | Record member check-in (QR/manual) | NO | **YES** | **YES** | **YES** | NO | Self (QR) |
| `attendance.override` | Manually alter past attendance | NO | **YES** | **YES** | NO | NO | NO |
| **Financial Ledger & POS** |
| `finance.collect_payment` | Collect fee, record cash/UPI/card | NO | **YES** | **YES** | **YES** | NO | NO |
| `finance.invoices.view` | View invoices and tax receipts | NO | **YES** | **YES** | **YES** | NO | Self |
| `finance.refund` | Issue payment refund or credit | NO | **YES** | NO | NO | NO | NO |
| `finance.revenue.view` | View gym gross revenue & profit | NO | **YES** | NO | NO | NO | NO |
| `finance.expenses.view` | View gym operational expenses | NO | **YES** | **YES** | NO | NO | NO |
| `finance.expenses.create` | Record new operational expense | NO | **YES** | **YES** | NO | NO | NO |
| **Staff & Trainers** |
| `staff.manage` | Invite, hire, edit staff & roles | NO | **YES** | NO | NO | NO | NO |
| `staff.salaries.view` | View staff salary & commission | NO | **YES** | NO | NO | NO | NO |
| `trainers.assign` | Assign personal trainer to member | NO | **YES** | **YES** | NO | NO | NO |
| **Fitness Programming** |
| `workouts.prescribe` | Create and assign workout plan | NO | **YES** | **YES** | NO | Assigned | NO |
| `workouts.view` | View member workout regimen | NO | **YES** | **YES** | NO | Assigned | Self |
| `diets.prescribe` | Create and assign diet plan | NO | **YES** | **YES** | NO | Assigned | NO |
| `diets.view` | View member diet plan | NO | **YES** | **YES** | NO | Assigned | Self |
| `progress.record` | Record body measurements & photos | NO | **YES** | **YES** | NO | Assigned | Self |
| **Leads & Sales CRM** |
| `leads.manage` | View, add, update sales leads | NO | **YES** | **YES** | **YES** | NO | NO |
| `leads.convert` | Convert lead into member | NO | **YES** | **YES** | **YES** | NO | NO |
| **Audit & Governance** |
| `audit.tenant.view` | View gym tenant activity logs | NO | **YES** | NO | NO | NO | NO |
| `audit.platform.view` | View global platform audit logs | **YES** | NO | NO | NO | NO | NO |
