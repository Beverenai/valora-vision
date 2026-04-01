

# Layer 2: Search & Match — Materialized View + Optimized RPC

## What This Does

Creates a pre-filtered materialized view (`active_listings`) of only active, recent properties with heavy indexes paid at refresh time, not query time. Adds `find_comparables_v2` (uses the view) and `find_comparables_with_fallback` (expanding search). Updates edge functions to use the new RPC.

## Changes

### 1. Migration: Materialized view + indexes + RPC functions

**`active_listings` materialized view**: Filters `properties` to `is_active = TRUE`, `scraped_at > NOW() - 90 days`, `price > 0`, `size_m2 > 0`. Includes a `feature_bits` integer for fast bitwise matching. Drops the `contact_info` column from the user's spec (doesn't exist on the table).

**Indexes on the view**: GIST on `location_point`, plus B-tree on `(property_type, operation)`, `rooms`, `size_m2`, `price_per_m2`, `zone_id`.

**Unique index** on `id` (required for `REFRESH MATERIALIZED VIEW CONCURRENTLY`).

**`find_comparables_v2`**: Queries `active_listings` instead of `properties`. Same signature as existing `find_comparables` but with improved similarity scoring (normalized size diff + room penalty).

**`find_comparables_with_fallback`**: 4-stage expanding search — 2km strict → 5km → 10km with relaxed rooms/size → municipality-wide fallback. Uses temp tables internally to accumulate results.

### 2. Update edge functions to use new RPC

**`calculate-valuation/index.ts`**: Change `supabase.rpc("find_comparables", ...)` → `supabase.rpc("find_comparables_with_fallback", ...)` so valuations automatically get expanded search when comparables are sparse.

**`analyze-listing/index.ts`**: Same change — use `find_comparables_with_fallback` for buy analyses.

### 3. Refresh strategy

Add a `refresh_active_listings()` SQL function that the scrape pipeline can call. The `scrape-properties` edge function will call this after completing a scrape batch.

## Note on `contact_info`

The user's spec includes `contact_info` in the view but this column doesn't exist on `properties`. The view will omit it — agency info (`agency_name`, `agency_phone`, `agency_logo`) is already available as separate columns.

## Files Modified

- New migration SQL (materialized view, indexes, unique index, 3 functions)
- `supabase/functions/calculate-valuation/index.ts` — use `find_comparables_with_fallback`
- `supabase/functions/analyze-listing/index.ts` — use `find_comparables_with_fallback`
- `supabase/functions/scrape-properties/index.ts` — call `refresh_active_listings()` after scrape

## What This Enables

- Sub-100ms comparable searches via pre-indexed materialized view
- Automatic fallback ensures every valuation gets enough comparables
- Layer 3 (Zone Intelligence) will build on top of this view

