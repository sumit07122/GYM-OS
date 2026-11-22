# GymOS — Component Specifications & Patterns

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. Core Component Primitives

Every UI component in GymOS adheres strictly to accessibility (WCAG 2.1 AA), keyboard navigation, and theme tokens.

### 1.1 Button (`<Button />`)
- **Variants:**
  - `primary`: Solid emerald `#10B981`, text `#090D16` bold. Hover `#059669`.
  - `secondary`: Slate surface `#1E293B`, border `rgba(255,255,255,0.08)`, text `#F8FAFC`.
  - `outline`: Transparent with border `#334155`, text `#94A3B8`. Hover text `#F8FAFC`.
  - `destructive`: Crimson `#EF4444`, text `#F8FAFC`. Hover `#DC2626`.
  - `ghost`: Transparent, text `#94A3B8`, hover bg `#1E293B`.
- **States:** Default, Hover, Active, Focus Ring (`ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#090D16]`), Disabled (`opacity-50 cursor-not-allowed`), Loading (replaces left icon with spinning Lucide `Loader2`).

### 1.2 Metric Card (`<MetricCard />`)
- **Structure:**
  - Top row: Metric Label (`text-xs text-slate-400 font-medium uppercase tracking-wider`) + Optional Icon Badge.
  - Middle: Big Number (`text-2xl font-bold font-mono tracking-tight text-slate-50`).
  - Bottom row: Trend indicator (e.g., `+12.4% vs last month` with green arrow icon) or descriptive subtext.
- **Surface:** `bg-[#111827] border border-white/10 rounded-lg p-5`.

### 1.3 Data Table (`<DataTable />`)
- **Features:** Sticky header, sorting indicator, pagination, row selection, responsive scroll container, column filter bar.
- **Styling:**
  - Header: `bg-[#0B0F19] text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4 border-b border-white/10`.
  - Rows: `hover:bg-[#1E293B]/50 border-b border-white/5 text-sm text-slate-200 transition-colors`.
  - Financial Columns: Right-aligned with tabular numbers font.

### 1.4 Status Badge (`<Badge />`)
- **Variants:**
  - `active` / `paid`: Green (`bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`)
  - `expiring` / `due`: Amber (`bg-amber-500/15 text-amber-400 border border-amber-500/30`)
  - `expired` / `overdue`: Red (`bg-rose-500/15 text-rose-400 border border-rose-500/30`)
  - `frozen` / `inactive`: Gray (`bg-slate-700/30 text-slate-400 border border-slate-600/30`)
  - `lead`: Blue (`bg-blue-500/15 text-blue-400 border border-blue-500/30`)

### 1.5 Dialog & Sheet Modal
- **Backdrop:** `bg-[#090D16]/80 backdrop-blur-sm fixed inset-0 z-50`.
- **Card:** `bg-[#111827] border border-white/10 rounded-xl shadow-2xl p-6`.
- **Destructive Actions:** Must require explicit confirmation dialog (e.g., "Deactivate Member", "Cancel Plan").

### 1.6 Form Controls
- **Inputs:** `bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`.
- **Error Feedback:** Red helper text below input with `aria-invalid="true"`.
- **Currency Input:** Pre-pended with non-editable `₹` badge and formatted with Indian commas.
