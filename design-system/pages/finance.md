# GymOS Page Specification — Payments & Financial ERP

**Page Route:** `/gym/:slug/finance`  
**Access Roles:** `gym_owner` (Full P&L), `gym_manager` (Collections & Expenses)  

---

## 1. Financial KPI Cards
1. **Gross Collections MTD:** `₹5,84,200` (Cash: 35%, UPI: 55%, Card: 10%).
2. **Total Outstanding Dues:** `₹62,500` across 28 members.
3. **Operational Expenses MTD:** `₹1,94,000` (Rent, Electricity, Maintenance).
4. **Net Operating Margin:** `₹3,90,200` (`+14.2% MoM`).

## 2. POS Fee Collection & Invoicing Engine
- **Collect Payment Modal:**
  - Select Member → Auto-populates outstanding dues.
  - Select Payment Type (`Membership Renewal`, `PT Package`, `Supplement`, `Locker`).
  - Amount Paid + Discount + Calculated GST (CGST 9% + SGST 9% or IGST 18%).
  - Payment Method: Cash, UPI (records UTR/reference number), Card, Net Banking.
  - Immediate printable & downloadable GST tax invoice generation.

## 3. Transaction History Table
- Filters: Date Range Picker, Payment Method, Payment Type, Invoice Search.
- Columns: `Invoice #`, `Date & Time`, `Member Name`, `Payment Method`, `Gross Amount`, `Tax (GST)`, `Net Paid`, `Status`, `Receipt Action`.
