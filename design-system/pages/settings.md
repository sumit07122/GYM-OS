# GymOS Page Specification — Gym Settings & Branding

**Page Route:** `/gym/:slug/settings`  
**Access Roles:** `gym_owner` (Exclusive)  

---

## 1. General Gym Profile
- Gym Legal Business Name, Trade Name, Phone, Email.
- Full Indian Postal Address: Line 1, Line 2, City, State (GST Jurisdiction), Pincode.
- Operating Shifts: Morning Shift (e.g., 05:30 AM - 12:00 PM), Evening Shift (04:00 PM - 10:30 PM), Sunday Hours.

## 2. White-Label Branding Settings
- **Logo Uploader:** PNG / SVG uploader with real-time preview on dark and light backgrounds.
- **Brand Colors:** Primary Accent Color Picker (default `#10B981`) + Secondary Color.
- **Unique Gym Slug:** e.g., `gymos.in/gym/olympia-fitness` or custom subdomain.

## 3. GST & Financial Configuration
- GSTIN Registration Number (15-character verification regex).
- Tax Configuration: Tax Inclusive vs Tax Exclusive pricing default.
- Consecutive Invoice Numbering: Custom Prefix (e.g., `OLY/2026/`) and Next Sequence Number.

## 4. Operational Rules & Policies
- Max annual freeze allowance (days per member).
- Anti-duplicate attendance lockout interval (e.g., 60 minutes).
- WhatsApp notification opt-in toggle.
