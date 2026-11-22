# GymOS Page Specification — Owner & Admin Dashboard

**Page Route:** `/gym/:slug/dashboard`  
**Target Viewport:** Desktop (1440px primary), Tablet (1024px), Mobile (390px)  
**Access Roles:** `gym_owner`, `gym_manager`, `receptionist` (restricted)  

---

## 1. Page Header Section
- Left: Active Gym Name with verification badge + Current Date & Day in Indian format (`Sunday, 22 Nov 2026`).
- Right: Quick Action Buttons (`+ Register Member`, `Mark Attendance`, `Collect Fee`) + Notification Bell + User Profile Avatar.

## 2. Top Metric KPI Grid (4 Columns Desktop, 2 Tablet, 1 Mobile)
1. **Total Active Members:** e.g., `482` (`+18 this month`, badge green).
2. **Today's Attendance:** e.g., `124` check-ins (`Peak hour: 6:00 PM - 8:00 PM`).
3. **Monthly Collections (MTD):** e.g., `₹4,28,500` (vs `₹3,90,000` target).
4. **Pending Dues / Expiring (7 Days):** e.g., `₹48,000` / `24 Members`.

## 3. Analytics & Visualization Section
- **Revenue & Collections Bar/Area Chart:** 6-month historical trajectory showing Cash vs UPI vs Card split.
- **Attendance Flow Heatmap / Density Graph:** Hourly check-in volume throughout the day.

## 4. Operational Feeds & Action Lists (2 Columns)
- **Left Column: Upcoming Expiries & Renewals:**
  - Member Avatar, Name, Plan, Expiry Date, Quick WhatsApp reminder button, Renew CTA.
- **Right Column: Recent Front-Desk Check-Ins:**
  - Real-time stream of check-ins with timestamp, member code, method (QR / Manual), and assigned trainer.

## 5. States
- **Loading:** Skeleton pulses for 4 KPI cards and chart placeholders.
- **Empty State:** Guided onboarding checklist for new gyms (1. Add Membership Plans, 2. Add First Member, 3. Generate QR code).
