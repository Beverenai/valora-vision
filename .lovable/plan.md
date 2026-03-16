

## Plan: ValoraCasa Backend Valuation System

This is a large system. I'll break it into phases that can be implemented incrementally.

### Current State
- Tables exist: `properties_for_sale`, `properties_for_rent`, `leads_sell`, `leads_rent`
- No edge functions exist
- No PostGIS, no geo-queries
- Result pages show **mock/hardcoded data** (hardcoded €4,100/m², mock analysis text)
- Form submits directly to `leads_sell`/`leads_rent` and navigates to result

### Phase 1: Database — Enable Geo-Queries + Add Valuation Infrastructure

**Migration 1**: Enable PostGIS, add geography columns to existing property tables, create the `find_comparables` RPC function, and add `scrape_zones` table.

- Enable `postgis` extension
- Add `location_point GEOGRAPHY(POINT, 4326)` to `properties_for_sale` and `properties_for_rent`
- Add trigger to auto-populate `location_point` from existing `latitude`/`longitude`
- Backfill existing rows
- Add `scrape_zones` table (for future Apify scheduling)
- Create `find_sale_comparables()` RPC function that queries `properties_for_sale` using `ST_DWithin` for radius search, filtering by type/size/rooms
- Add `status` column to `leads_sell` and `leads_rent` (`pending`/`processing`/`ready`/`failed`)
- Add RLS policy allowing anonymous SELECT on `leads_sell`/`leads_rent` by ID (so result page works without auth)

### Phase 2: Edge Function — `calculate-valuation`

Create `supabase/functions/calculate-valuation/index.ts`:

1. Receives form data (address, lat/lng, property details, features, contact info, valuation_type)
2. Inserts lead into `leads_sell` or `leads_rent` with `status='processing'`
3. Calls `find_sale_comparables` RPC to get 15-20 comparable properties
4. Filters outliers (>2 std dev from median)
5. Calculates median price/m² from remaining
6. Applies feature adjustments (pool +10%, sea views +20%, garage +5%, etc.)
7. Computes: `estimated_value = adjusted_price_m2 × size_m2`, low/high range (±15%)
8. For rent: similar calculation using rental comparables
9. Calls Lovable AI (Gemini) to generate analysis text and market trends
10. Updates the lead record with all calculated values + `status='ready'`
11. Returns the lead ID

### Phase 3: Frontend — Wire Up Edge Function

**`SellValuation.tsx`** and **`RentValuation.tsx`**:
- Change `handleSubmit` to call `supabase.functions.invoke('calculate-valuation', { body: formData })` instead of direct table insert
- Navigate to result page with the returned ID

**`SellResult.tsx`** and **`RentResult.tsx`**:
- Poll for `status='ready'` if valuation is still processing
- Display real calculated values from the lead record instead of mock data
- Show real comparable properties from `comparable_properties` JSONB column

### Files Changed
- **New migration SQL** — PostGIS, geo columns, RPC function, scrape_zones, status columns, RLS
- **New** `supabase/functions/calculate-valuation/index.ts` — core valuation logic
- **Edit** `supabase/config.toml` — add function config with `verify_jwt = false`
- **Edit** `src/pages/SellValuation.tsx` — call edge function
- **Edit** `src/pages/RentValuation.tsx` — call edge function  
- **Edit** `src/pages/SellResult.tsx` — use real data, add polling
- **Edit** `src/pages/RentResult.tsx` — use real data, add polling

### What's NOT in this phase (future work)
- Apify scraper integration (needs API key + scheduled edge function)
- PDF report generation
- On-demand scraping when <5 comparables found
- Professional agent matching from real data

