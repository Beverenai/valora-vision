

# Unified Properties Table + Valuations Schema

## What This Does

Consolidates the two separate property tables (`properties_for_sale`, `properties_for_rent`) into a single `properties` table with an `operation` column (`sale` / `rent`). Adds `valuations` and `valuation_comparables` tables. Replaces the two separate RPC functions with one unified `find_comparables`.

## Why

- Simpler schema — one table to query, scrape into, and maintain
- Unified `find_comparables` RPC eliminates duplicated logic
- `valuations` table provides a clean history of all user valuations (currently spread across `leads_sell` / `leads_rent`)
- `valuation_comparables` links each valuation to the actual properties used

## Migration Plan

### 1. Create `properties` table + indexes + trigger

Create the unified table with all columns from the user's spec: `operation`, location fields, price, specs, boolean features, metadata, agency info, timestamps. Add the PostGIS trigger to auto-populate `location_point`, plus indexes on operation, type, rooms, municipality, scraped_at, and GIST on location_point.

**Important**: Keep `properties_for_sale` and `properties_for_rent` alive (no DROP) so existing data and edge functions keep working during transition. The new table is additive.

### 2. Create `valuations` + `valuation_comparables` tables

- `valuations`: stores the user's property details, valuation results, rental estimates, market context, contact info, and status
- `valuation_comparables`: FK to both `valuations` and `properties`, with `similarity_score` and `distance_km`
- RLS: public INSERT + SELECT (same pattern as leads tables), service role UPDATE

### 3. Create unified `find_comparables` RPC

Single function with `p_operation` parameter. Queries the new `properties` table. Same similarity scoring logic. This replaces `find_sale_comparables` and `find_rent_comparables` (kept for backward compatibility but the new code will use the unified one).

### 4. Migrate data from old tables → `properties`

SQL migration copies rows from `properties_for_sale` (operation='sale') and `properties_for_rent` (operation='rent') into the new `properties` table, mapping column names (e.g., `external_id` → `property_code`, `price` stays, `monthly_rent` → `price` for rent rows, `built_size_sqm` → `size_m2`).

### 5. Update Edge Functions

- **`calculate-valuation/index.ts`**: Call `find_comparables` (unified) instead of `find_sale_comparables` / `find_rent_comparables`. Optionally write to `valuations` table alongside existing `leads_*` tables (backward compatible).
- **`analyze-listing/index.ts`**: Query `properties` instead of `properties_for_sale`.
- **`process-scrape-job/index.ts`**: Upsert into `properties` instead of `properties_for_sale` / `properties_for_rent`.
- **`scrape-properties/index.ts`**: Same — upsert into `properties`.

### 6. No frontend changes needed

The frontend calls edge functions, not tables directly. The edge functions return the same shape. Existing `leads_sell` and `leads_rent` tables remain untouched — result pages still work.

## Technical Details

### Column mapping (old → new)

```text
properties_for_sale              →  properties
─────────────────────────────────────────────
external_id                      →  property_code
price                            →  price
price_per_sqm                    →  price_per_m2
built_size_sqm                   →  size_m2
bedrooms                         →  rooms
listing_url                      →  idealista_url
image_urls (array)               →  images (jsonb)
city                             →  municipality
(new)                            →  operation = 'sale'

properties_for_rent              →  properties
─────────────────────────────────────────────
external_id                      →  property_code
monthly_rent                     →  price
rent_per_sqm                     →  price_per_m2
built_size_sqm                   →  size_m2
bedrooms                         →  rooms
listing_url                      →  idealista_url
(new)                            →  operation = 'rent'
```

### Files Modified
- New migration SQL (schema + data migration + RPC)
- `supabase/functions/calculate-valuation/index.ts`
- `supabase/functions/analyze-listing/index.ts`
- `supabase/functions/process-scrape-job/index.ts`
- `supabase/functions/scrape-properties/index.ts`

### Risk Mitigation
- Old tables are NOT dropped — they remain as-is
- Old RPC functions are NOT dropped — backward compatible
- Migration is additive, not destructive

