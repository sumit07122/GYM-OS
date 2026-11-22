# GymOS Page Specification — Trainer & Staff Management

**Page Route:** `/gym/:slug/trainers` & `/gym/:slug/staff`  
**Access Roles:** `gym_owner` (Full), `gym_manager` (Assigned staff)  

---

## 1. Trainer Roster Grid & Capacity View
- Grid cards for each personal trainer:
  - Profile Photo, Specializations (e.g., `Hypertrophy`, `CrossFit`, `Weight Loss`).
  - Active PT Clients Count: e.g., `14 / 20 capacity`.
  - Commission Model: Fixed Monthly vs % of PT revenue.
  - Quick Button: `View Assigned Members`, `Assign New Client`.

## 2. Trainer Detail View
- **Tab 1: Assigned Client Roster:** Table of members under this trainer with next renewal dates and fitness goals.
- **Tab 2: Routine & Diet Prescriptions:** Quick access to workout splits and nutrition plans crafted by this trainer.
- **Tab 3: Attendance & Leaves:** Punch-in records and approved leave requests.

## 3. Security Boundary
- Personal Trainers logging into the app only have access to `/trainer/*` routes—viewing strictly their assigned clients, workout library, and schedules. They cannot view gym revenues or unassigned members.
