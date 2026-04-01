

# Layer 1: Raw Property Data — Enhance Existing `properties` Table

## Current State

The `properties` table already exists with all the core columns (property_code, operation, price, size_m2, rooms, bathrooms, features, lat/lng, location_point, zone_id, scraped_at, etc.) and a PostGIS trigger + GIST index.

## What's Missing

1. **`is_active` column** — doesn't exist yet. Needed to soft-delete properties removed from Idealista instead of hard-deleting.
2. **Foreign key on `zone_id`** — currently no FK constraint to `zones(id)`.
3. **Additional indexes** — `idx_prop_zone` and `idx_prop_active` don't exist yet.

## Changes

### 1. Migration: Add `is_active` + FK + indexes

```sql
-- Add is_active column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add FK to zones
ALTER TABLE properties 
  ADD CONSTRAINT fk_properties_zone 
  FOREIGN KEY (zone_id) REFERENCES zones(id);

-- New indexes for the layer architecture
CREATE INDEX IF NOT EXISTS idx_prop_zone ON properties(zone_id);
CREATE INDEX IF NOT EXISTS idx_prop_active ON properties(is_active, operation);
```

### 2. Update `scrape-properties` edge function

Add logic to mark properties as inactive when they're no longer found in a scrape run:
- After upserting new listings for a zone, query existing active properties for that zone
- Any property_code not in the fresh scrape batch → set `is_active = false`
- This preserves historical data while keeping the active set clean

### 3. No partitioning (yet)

Partitioning requires recreating the table and is complex with existing data + FKs. At current scale (<100K rows), indexes are sufficient. Partitioning can be added later when data grows significantly.

## Files Modified
- New migration SQL (add column, FK, indexes)
- `supabase/functions/scrape-properties/index.ts` — add is_active deactivation logic

## What This Enables
- Layer 2 (Search & Match) can filter on `is_active = true` for fresh comparables
- Layer 3 (Zone Intelligence) materialized views will use `is_active` to exclude stale listings
- Historical data preserved for trend analysis

