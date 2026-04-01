

# Layer 3: Zone Intelligence — zone_stats Materialized View

## What This Does

Creates a `zone_stats` materialized view that pre-computes per-zone market statistics (median/avg prices, feature prevalence, feature premiums) from `active_listings`. This eliminates aggregate queries at valuation time. Updates `calculate-valuation` to use dynamic feature premiums from `zone_stats` instead of hardcoded multipliers.

## Current State

- `zones` table already exists with all needed columns (name, municipality, province, tier, center_lat/lng, etc.)
- `active_listings` materialized view exists (Layer 2) with zone_id, features, prices
- `calculate-valuation` uses hardcoded `FEATURE_ADJUSTMENTS` (pool: +10%, sea_views: +20%, etc.)
- `refresh_active_listings()` function exists, called after scrape runs
- No `polygon` column on zones yet (low priority, can add later)

## Changes

### 1. Migration: Create `zone_stats` materialized view

Aggregates from `active_listings` grouped by `(zone_id, operation, property_type)`:

- **Price stats**: listing_count, median/avg/min/max/stddev price_per_m2, median/avg absolute price
- **Size stats**: avg/median size_m2, median rooms
- **Feature prevalence**: % with pool, garage, sea_views, terrace, lift
- **Feature premiums**: median price_per_m2 WITH feature vs WITHOUT feature (for pool, sea_views, garage, terrace, lift) — enables dynamic premium calculation
- **Freshness**: last data update timestamp

Unique index on `(zone_id, operation, property_type)` for concurrent refresh. Additional index on `zone_id`.

### 2. Create `refresh_zone_stats()` function

Simple `SECURITY DEFINER` function that refreshes `zone_stats` concurrently.

### 3. Update `refresh_active_listings()` to also refresh `zone_stats`

Chain the refresh: after `active_listings` refreshes, automatically refresh `zone_stats` too. Single RPC call from the scrape pipeline refreshes both.

### 4. Create `get_zone_stats` RPC function

Takes `p_zone_id`, `p_operation`, `p_property_type` and returns the pre-computed stats row. Used by `calculate-valuation` to get instant zone context.

### 5. Update `calculate-valuation` edge function

Replace hardcoded `FEATURE_ADJUSTMENTS` with dynamic premiums from `zone_stats`:

```text
Before: pool premium = hardcoded 0.10 (10%)
After:  pool premium = (median_m2_with_pool - median_m2_without_pool) / median_m2_without_pool
        Fallback to hardcoded if zone has < 5 properties with that feature
```

Also enrich the AI analysis prompt with zone context (median price, listing count, feature prevalence) for more data-driven text.

### Files Modified

- New migration SQL (zone_stats view, indexes, refresh function, get_zone_stats RPC)
- `supabase/functions/calculate-valuation/index.ts` — use dynamic premiums + zone context

