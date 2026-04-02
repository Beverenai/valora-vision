

# STEG 7: Agent Sales Portfolio & Why-Join Data

This is a large feature with 6 interconnected parts. I recommend implementing it in phases to keep each change reviewable and testable.

## Overview

Agents register completed sales (paste Idealista link or manual entry). Sales appear on their public profile, build trust with property owners, and feed ValoraCasa's internal transaction database for better valuations.

---

## Phase 1: Database & Migration

Create the `agent_sales` table with all fields from the spec:
- Property info (type, bedrooms, bathrooms, size, sale price, show_price toggle)
- Location (address_text, lat/lng, location_point geography, zone_id FK)
- Timing (sale_date, listed_date, days_on_market generated column)
- Listing enrichment fields (listing_url, listing_source, enriched_*, photo_url)
- Verification (verified, verification_method)
- Spatial index + trigger to auto-set `location_point` and `zone_id`

Create materialized view `agent_sales_summary` for quick stats per professional.

RLS policies:
- Agents can INSERT/UPDATE/DELETE their own sales (via professional's user_id)
- Public can SELECT sales (for profile display)

**Note:** The spec references `agencies` and `agents` tables, but the project uses `professionals` with `agency_id` self-reference. The FK will reference `professionals(id)` instead.

---

## Phase 2: "My Sales" Section in ProDashboard

1. Add `"sales"` to the `Section` type union
2. Add nav item under Business group: "My Sales" with Home icon
3. Build `SalesSection` component:
   - Stats row (total sales, verified, avg days to sell, last 12 months)
   - Grid view with sale cards (photo, SOLD badge, verified badge, property info)
   - Incentive card with progressive milestones (1+, 3+, 5+, 10+ sales)
   - Empty state with CTA
4. Build `AddSaleDialog` with two modes:
   - **Link mode** (primary): Paste Idealista/Fotocasa URL — for now, just store the URL without auto-enrichment (enrichment via n8n is a separate step)
   - **Manual mode**: Enter property type, bedrooms, size, location, sale price, date
   - Photo upload step (optional)

**No map view initially** — Mapbox integration is a separate concern. Start with grid-only view.

---

## Phase 3: Recent Sales on Agent Profile

Add "RECENT SALES" section to `/agentes/:slug` page:
- Grid of up to 6 recent sales (photo, SOLD badge, verified badge, type, area, date)
- "Show all X sales" button if more than 6
- Empty state hidden (don't show section if 0 sales)
- Add sales count to the quick stats bar

---

## Phase 4: "Why Agents Join" Section on ProLanding

Add market insight section to `/pro` landing page:
- "What sellers look for in an agent" with 5 data points (Proximity 29%, Reviews 21%, Recent Sales 19%, Experience 18%, Brand 14%)
- CTA: "Claim Your Zone"
- Editorial styling: serif headings, terracotta accents, warm background

---

## Phase 5: Merit Score & Action Items in Dashboard

1. Add "Sales" factor to merit score breakdown in OverviewSection
   - Scoring: 0 sales = 0pts, 1-5 = 30, 6-15 = 60, 16-30 = 80, 30+ = 100, +10 bonus if >50% verified
2. Add "Market Insight" card when agent has < 5 sales
3. Add action item for 0 sales registered

---

## Technical Details

- **Table FK**: Uses `professional_id UUID REFERENCES professionals(id)` instead of separate agencies/agents tables
- **Generated column**: `days_on_market` computed from `sale_date - listed_date`
- **Geo trigger**: Auto-sets `location_point` from lat/lng and matches `zone_id` from zones geometry
- **No enrichment edge function yet**: The "paste link" flow stores the URL but doesn't auto-scrape. That requires Apify/n8n integration (future step)
- **No Mapbox map yet**: Grid view only. Map can be added later with a Mapbox token

### Files Modified/Created
- `supabase/migrations/` — new migration for `agent_sales` table, indexes, trigger, materialized view, RLS
- `src/pages/ProDashboard.tsx` — add "sales" section, SalesSection component, AddSaleDialog
- `src/pages/AgentProfile.tsx` — add Recent Sales section
- `src/pages/ProLanding.tsx` — add "Why Agents Join" market insight section
- `src/components/dashboard/SalesSection.tsx` (new) — sales portfolio UI
- `src/components/dashboard/AddSaleDialog.tsx` (new) — add sale form dialog

---

## Suggested Implementation Order
1. Database migration (Phase 1)
2. Dashboard sales section with add dialog (Phase 2)
3. Agent profile recent sales (Phase 3)
4. Pro landing market insight (Phase 4)
5. Merit score updates (Phase 5)

Shall I proceed with all phases, or start with Phase 1-2 first?

