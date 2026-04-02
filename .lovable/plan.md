

# Upgrade Admin Panel for Scale + Better Navigation

## Summary

Four changes to make the admin panel production-ready for high-volume valuations:

### 1. Rename "Leads" to "Valuations" everywhere
- Sidebar group label: "Leads" → "Valuations"
- Sidebar item: "All Leads" → "All Valuations"
- StatsBar tile: "Total Leads" → "Total Valuations"
- Table header text, empty states, counter text — all say "valuations" instead of "leads"
- Internal code variables stay as-is (no refactor needed for variable names)

### 2. Remove the always-visible StatsBar
The horizontal stats bar ("Total Leads / Active Zones / Jobs Completed / Health") takes up vertical space and duplicates sidebar navigation. Remove the `<StatsBar>` block entirely from the admin layout. The sidebar already provides navigation to each section.

### 3. Add "Buy Analyses" tab in sidebar
Add a new sidebar item under the "Valuations" group:
- Key: `"buy"`, label: "Buy Analyses", icon: `ShoppingCart` (or `TrendingUp`)
- New `BuyAnalysesTab` component showing a searchable, filterable table of `buy_analyses` records with columns: Date, Email, Address, City, Price Score, Asking Price, Estimated Value, Status, and a link to `/buy/result/:id`
- Filters: city search input, price score dropdown, status dropdown
- Server-side pagination (50 per page) using `.range()` for scalability

### 4. Make sidebar full-height
Change the sidebar `<aside>` from `py-4` to `min-h-0 h-full` so it stretches the full height of the viewport. The parent flex container already uses `flex-1 overflow-hidden`, so adding `h-full` to the sidebar will make it fill the available space.

### 5. Scale the Valuations (formerly Leads) tab
- Add a text search input that filters by address, city, name, or email (client-side for now, with debounce)
- Add city filter dropdown (populated from distinct cities in the fetched data)
- Increase default limit to 500 and add basic "Load more" pagination

## Updated sidebar structure

```text
VALUATIONS
  All Valuations    (sell + rent)
  Buy Analyses      (buy_analyses table)

DATA
  Zones
  Scrape Jobs
  Resales Online

SYSTEM
  Valuations Map
  Health
```

## Files to change

| File | Change |
|------|--------|
| `src/components/admin/AdminSidebar.tsx` | Add `"buy"` to `AdminSection` type; rename "Leads" group to "Valuations"; rename "All Leads" to "All Valuations"; add "Buy Analyses" item; add `h-full` to aside |
| `src/pages/Admin.tsx` | Remove `<StatsBar>` component usage; rename label text from "leads" to "valuations"; add `BuyAnalysesTab` component with search/filter/pagination; add text search + city filter to the main valuations tab; render `BuyAnalysesTab` for `section === "buy"` |

No database changes needed.

