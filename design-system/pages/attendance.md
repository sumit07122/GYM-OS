# GymOS Page Specification — Attendance & Access Control

**Page Route:** `/gym/:slug/attendance`  
**Access Roles:** `gym_owner`, `gym_manager`, `receptionist`  

---

## 1. Dual-Mode Interface Layout
Designed for high-speed reception desk terminals:

### Left Panel (40% width): Rapid Check-In Terminal
- **Live Camera / USB Scanner Viewfinder:**
  - Dedicated scanner box decoding dynamic GymOS member QR codes.
  - Audio/Visual confirmation chime on successful scan (Green flash).
- **Manual Quick Search Bar:**
  - Large input with auto-focus: "Enter Member Code or Mobile Number...".
  - Instant dropdown result showing Member Photo, Name, and Status.
  - One-click `[Check-In]` button with duplicate lockout warning if scanned within 60 mins.

### Right Panel (60% width): Live Attendance Feed
- **Header:** Date Selector + Real-time check-in counter (`142 Checked in today`).
- **Live Stream Table:**
  - Timestamp (`07:42 AM`)
  - Member (`Photo + Full Name + M-Code`)
  - Plan Status (`Active / Expiring in 2 days`)
  - Check-In Method (`QR Scan` vs `Receptionist Manual`)
  - Action (`Checkout` / `Undo Override` for managers)

## 2. Peak-Hour Density Widget
- Interactive hourly bar chart indicating real-time occupancy vs maximum gym capacity limit.
