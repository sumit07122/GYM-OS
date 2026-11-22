# GymOS — Master Design System Specification

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Design Philosophy:** Enterprise Grade, Dark-First High-Performance Fitness ERP  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. Aesthetic Direction & Principles

GymOS avoids generic, loud, or overly saturated gym templates. It presents a **sleek, high-density, command-center aesthetic** built for daily operational endurance:

1. **Dark-First Architecture:** Primary interface renders on deep obsidian and slate charcoal backgrounds (`#090D16` to `#161F30`), minimizing eye strain in low-light gym reception desks and training floors.
2. **Precision High-Contrast Accents:** Focused electric emerald/lime accents (`#10B981` / `#34D399`) denote active states, key CTAs, and positive financial trajectories without distracting from tabular data.
3. **Information Density & Hierarchy:** Compact tables, well-proportioned metric widgets, crisp 1px borders (`rgba(255,255,255,0.08)`), and restrained elevation shadows.
4. **Data Integrity & Feedback:** Every interactive component possesses 5 mandatory visual states: Default, Hover/Active, Focus Ring (accessible keyboard navigation), Loading/Skeleton, and Disabled.

---

## 2. Color System

### 2.1 Neutral Foundation (Dark Mode Default)
- **Background Base (`bg-background`):** `#090D16` (Obsidian Deep)
- **Surface Layer 1 (`bg-card` / `bg-surface`):** `#111827` (Slate Charcoal)
- **Surface Layer 2 (`bg-muted` / `bg-popover`):** `#1E293B` (Elevated Panel)
- **Borders & Dividers (`border-border`):** `rgba(255, 255, 255, 0.08)` / `#334155`
- **Text Primary (`text-foreground`):** `#F8FAFC` (Slate 50)
- **Text Secondary (`text-muted-foreground`):** `#94A3B8` (Slate 400)
- **Text Subtle (`text-dim`):** `#64748B` (Slate 500)

### 2.2 Semantic & Brand Accents
- **Primary Brand (`bg-primary`):** `#10B981` (Emerald 500)
- **Primary Hover (`bg-primary-hover`):** `#059669` (Emerald 600)
- **Primary Accent / Glow:** `#34D399` (Emerald 400)
- **Success (`badge-success`):** `#10B981` (Green / Active Members, Completed Payments)
- **Warning (`badge-warning`):** `#F59E0B` (Amber / Expiring Memberships, Due Payments)
- **Destructive / Danger (`badge-danger`):** `#EF4444` (Red / Expired, Overdue, Cancelled)
- **Informational (`badge-info`):** `#3B82F6` (Blue / Leads, Inquiries, Notifications)

---

## 3. Typography Scale

**Font Family:**
- Primary UI: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Numeric & Financial Data: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` for tabular currency alignment.

| Scale Token | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-xs` | 12px (0.75rem) | 16px | 400 / 500 | Badges, table metadata, timestamps |
| `text-sm` | 14px (0.875rem) | 20px | 400 / 500 | Body copy, form inputs, table rows |
| `text-base` | 16px (1.00rem) | 24px | 500 / 600 | Card titles, button text, dialog headers |
| `text-lg` | 18px (1.125rem) | 28px | 600 | Subheadings, section titles |
| `text-xl` | 20px (1.25rem) | 28px | 600 / 700 | Modal titles, page headers |
| `text-2xl` | 24px (1.50rem) | 32px | 700 | Primary metric cards, KPI numbers |
| `text-3xl` | 30px (1.875rem) | 36px | 800 | Dashboard hero summaries |

---

## 4. Spacing, Elevation & Radius

### 4.1 Spacing Grid
Built on a disciplined 4px base grid:
- `gap-1`: 4px
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px (Standard component padding)
- `gap-6`: 24px (Section spacing)
- `gap-8`: 32px (Page-level separation)

### 4.2 Border Radius
- `rounded-sm`: 4px (Badges, tags)
- `rounded-md`: 6px (Input fields, buttons, dropdown items)
- `rounded-lg`: 8px (Cards, modal containers)
- `rounded-xl`: 12px (Flyout drawers, dashboard widgets)
- `rounded-full`: 9999px (Avatars, pills)

### 4.3 Elevation & Shadows
- **Card Shadow:** `0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)`
- **Modal / Popover Shadow:** `0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)`
- **Accent Glow:** `0 0 15px -3px rgba(16, 185, 129, 0.25)`
