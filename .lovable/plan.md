

# Resales Online API Integration

## Summary
Add Resales Online as a second property data source. This involves: database schema changes (new columns + config/log tables), a new edge function for syncing properties, and an admin UI tab to trigger and monitor syncs. The synced properties automatically become available to the valuation engine via the existing `find_comparables_with_fallback` RPC since it queries the unified `properties` table.

## Step 1: Database Migration

Add columns and tables to support the integration:

**On `properties` table:**
- `data_source TEXT DEFAULT 'idealista'` — tracks origin (idealista vs resales_online)
- `resales_reference TEXT` — Resales Online internal reference
- `resales_filter_id INTEGER` — which filter (1=sale, 2=ST rental, 3=LT rental)
- Indexes on `data_source` and `resales_reference`

**New table `resales_online_config`:**
- Stores API credentials (contact_id, api_key), filter settings, sync intervals, and last sync status
- Public RLS for read (admin checks done via password in the app)

**New table `resales_sync_log`:**
- Tracks each sync run: status, counts (fetched/upserted/deactivated), duration, errors
- FK to `resales_online_config`

**Deduplication function** `find_potential_duplicates()` — PostGIS proximity match (100m) + same type/rooms + similar size/price to flag cross-source duplicates.

**Refresh function** `refresh_materialized_views()` — refreshes `active_listings` and `zone_stats` after sync.

## Step 2: Store API Credentials as Secrets

The Resales Online API requires a `contact_id` (p1) and `api_key` (p2). These will be stored in the `resales_online_config` table (inserted by admin). The edge function reads them from the config table, not from env vars — so no separate secrets needed.

## Step 3: Edge Function — `resales-online-sync`

New file: `supabase/functions/resales-online-sync/index.ts`

- Accepts `{ filter_id }`, `{ sync_all: true }`, or no params (auto-sync due filters)
- Calls Resales Online V6 API: `SearchProperties` with pagination (50/page, 200ms delay)
- Transforms each property to match the unified `properties` schema (type mapping, feature extraction, GPS coords)
- Upserts into `properties` table with `property_code = "ROL-{Reference}"`, `data_source = "resales_online"`
- Deactivates stale properties not seen in current sync
- Logs everything to `resales_sync_log`
- Refreshes materialized views at the end
- CORS headers included for admin UI calls

Key mappings:
- Property types: Apartment/Villa/Townhouse/Finca/etc → internal types
- Features: parsed from Features JSON + description text
- Operation: filter_alias 1→sale, 2/3→rent

## Step 4: Admin Dashboard — Resales Online Tab

Add a new section to `src/pages/Admin.tsx`:

**API Status Card** — connection status, last sync time, total ROL properties count, "Sync All Now" button

**Filter Cards** — one per config entry showing filter name, last sync stats, status indicator, individual "Sync Now" button, enable/disable toggle

**Sync History Table** — from `resales_sync_log`, showing time, filter, status badge, fetched/upserted/deactivated counts, duration, errors. Sorted by newest first, 20 rows.

**Source filter in Properties section** — add a "Source" dropdown filter (All/Idealista/Resales Online) and source badges on property rows.

Also add the "Resales Online" entry to `AdminSidebar`.

## Step 5: Config Setup Modal

A dialog in the admin Resales Online tab to add/edit API credentials:
- Contact ID, API Key (masked), Filter Alias, Province, Sync Interval
- Save to `resales_online_config` table

## Why This Works for Valuations

The unified `properties` table is already queried by `find_comparables_with_fallback` — Resales Online properties will automatically appear as comparables once synced, with no changes needed to the valuation engine.

## Files Modified/Created
- **Migration SQL** — new columns, tables, functions
- `supabase/functions/resales-online-sync/index.ts` — new edge function
- `src/pages/Admin.tsx` — new Resales Online tab + source filter
- `src/components/admin/AdminSidebar.tsx` — add Resales Online nav item

