

## Plan: Redesign Admin Panel + Agent Dashboard (La Sala Style)

### Summary
Overhaul both `/admin` and `/pro/dashboard` to use the sidebar + stats bar layout pattern from the La Sala project, adapted to ValoraCasa's brand (terracotta accents, serif headings, warm tones).

---

### 1. Admin Panel (`/admin`) — Full Restructure

**Current**: Password gate, then flat `<Tabs>` with 4 tabs (Leads, Zones, Jobs, Health).

**New layout**:
```text
┌──────────────────────────────────────────────┐
│  Compact Header: "ValoraCasa Admin" + Badge  │
├────────┬─────────────────────────────────────┤
│        │  Stats Bar (KPI tiles)              │
│ Side-  ├─────────────────────────────────────┤
│ bar    │                                     │
│        │  Active Tab Content                 │
│ (nav   │  (Leads / Zones / Jobs / Health)    │
│  with  │                                     │
│  icons │                                     │
│  +     │                                     │
│  badges│                                     │
│  )     │                                     │
├────────┴─────────────────────────────────────┤
│  Mobile: collapsible dropdown nav            │
└──────────────────────────────────────────────┘
```

**New files**:
- `src/components/admin/AdminSidebar.tsx` — Grouped sidebar with icons, badge counts (leads count, zones count, failed jobs), mobile dropdown mode
- `src/components/admin/AdminStatsBar.tsx` — Horizontal KPI tiles (Total Leads, Active Zones, Jobs Today, Health Score) — clickable to jump to tab
- `src/components/admin/AdminHeader.tsx` — Compact header with title + dark/light toggle

**Modified files**:
- `src/pages/Admin.tsx` — Replace `<Tabs>` with sidebar layout. Keep password gate. Extract existing tab content into the new layout. Add dark mode state with `ccTheme` toggle.

**Key patterns from La Sala**:
- Sidebar groups: "Leads" (Sell, Rent, Buy), "Data" (Zones, Jobs), "System" (Health, Settings)
- Badge counts on sidebar items (e.g. pending jobs count)
- Mobile: current-tab dropdown button that expands to full nav list
- Dark mode: `bg-[hsl(220,18%,9%)]` with white/10 borders

---

### 2. Agent Dashboard (`/pro/dashboard`) — Layout Upgrade

**Current**: Uses shadcn `<Sidebar>` component with 5 sections. Already has sidebar pattern but basic styling.

**Changes**:
- Add a **stats bar** at top of content area showing: Total Leads, New This Week, Profile Views (30d), Avg Rating
- Improve sidebar styling: grouped sections, terracotta accent for active item, badge counts
- Add compact header with agent name + verified badge
- Mobile: replace bottom tab bar with La Sala-style dropdown nav (current tab shown, tap to expand)
- Optional dark mode toggle

**Modified files**:
- `src/pages/ProDashboard.tsx` — Restyle sidebar items, add stats bar, improve header, update mobile nav

---

### 3. Shared Components

**New file**: `src/components/admin/StatsBar.tsx`
- Reusable horizontal stats tile bar (used by both Admin and Agent Dashboard)
- Props: array of `{ key, label, icon, color, count }` + active filter + onSelect
- Light/dark theme support
- Responsive: horizontal scroll on mobile

---

### Technical Details

- Dark mode uses a local state (`ccTheme`) and conditional classes (like La Sala), not Tailwind's `dark:` — keeps it scoped to admin pages only
- Sidebar on mobile becomes a collapsible dropdown (not a sheet/drawer) for faster access
- All existing data fetching logic stays unchanged — only the layout shell changes
- Password gate on Admin remains as-is
- Auth gate on ProDashboard remains as-is

### Files

| Action | File |
|--------|------|
| New | `src/components/admin/AdminSidebar.tsx` |
| New | `src/components/admin/AdminStatsBar.tsx` |
| New | `src/components/admin/AdminHeader.tsx` |
| New | `src/components/admin/StatsBar.tsx` (shared) |
| Modified | `src/pages/Admin.tsx` |
| Modified | `src/pages/ProDashboard.tsx` |

