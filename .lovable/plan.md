

## Plan: Robust Backend Engine + Admin Dashboard

This is a large infrastructure overhaul based on the Backend Blueprint v3. The goal is to move from on-demand scraping to pre-scraped data, add automated scheduling, materialized views for fast queries, and a comprehensive admin dashboard.

---

### Current State vs Blueprint

**What exists now:**
- `zones` table (simple: name, slug, region) — no scraping config
- `scrape_zones` table (separate, has location_id, tier, last_scraped_at) — partially overlapping with zones
- `properties_for_sale` / `properties_for_rent` / `short_term_rentals` tables — working but no PostGIS `location_point` column indexed
- `scrape-properties` edge function — manual trigger only, no scheduling
- `calculate-valuation` edge function — works but uses basic RPC, no materialized views
- `analyze-listing` edge function — works for BUY flow
- Admin page — simple leads table only, no backend health visibility

**What the blueprint adds:**
1. Unified zone config with scraping parameters (merge `scrape_zones` into `zones`)
2. `scrape_jobs` table for job queue tracking
3. Materialized views (`active_listings`, `zone_stats`) for fast queries
4. `pg_cron` + `pg_net` for automated scraping
5. `process-scrape-job` edge function (cron-driven job processor)
6. Enhanced `find_comparables` RPC with similarity scoring
7. `system_health_check()` RPC for admin
8. Stale property deactivation
9. Admin dashboard with zones, jobs, health metrics

---

### Implementation — 4 Stages

#### Stage 1: Database Schema Enhancement (migration)

**Modify `zones` table** — add scraping config columns:
- `municipality TEXT`
- `idealista_location TEXT` (the location ID for Apify)
- `tier TEXT CHECK (tier IN ('hot', 'warm', 'cold'))` default 'warm'
- `max_items INTEGER DEFAULT 500`
- `last_scraped_at TIMESTAMPTZ`
- `last_scrape_count INTEGER DEFAULT 0`
- `last_scrape_status TEXT DEFAULT 'pending'`
- `total_properties INTEGER DEFAULT 0`
- `center_lat DECIMAL(10,7)`, `center_lng DECIMAL(10,7)`

**Create `scrape_jobs` table:**
- `id`, `zone_id` (FK zones), `status` (pending/running/completed/failed), `apify_run_id`, `items_found`, `items_upserted`, `error_message`, `started_at`, `completed_at`, `created_at`
- RLS: public select, service role insert/update

**Add `location_point` geography column** to `properties_for_sale` (if not already there) with PostGIS trigger for auto-population.

**Create materialized views:**
- `active_listings` — filtered view of active properties with PostGIS index
- `zone_stats` — pre-aggregated stats per zone/type/operation including feature premiums

**Create RPC functions:**
- `refresh_search_views()` — refreshes both materialized views
- `find_comparables()` — enhanced version with tiered radius expansion (2km → 5km → 10km → 25km) and similarity scoring
- `calculate_valuation()` — SQL-level valuation with IQR outlier removal and data-driven feature premiums from zone_stats
- `system_health_check()` — returns JSON with total/active properties, stale zones, today's valuations, pending/failed jobs
- `deactivate_stale_properties()` — marks properties inactive after 60 days
- `queue_due_scrapes()` — inserts pending scrape_jobs based on zone tier schedules

**Insert initial zone data** for Costa del Sol (Marbella, Puerto Banús, Estepona, etc.) using the insert tool.

#### Stage 2: Edge Function — process-scrape-job

**Create `supabase/functions/process-scrape-job/index.ts`:**
- Called by pg_cron every minute
- Picks the oldest pending `scrape_job`, marks it running
- Starts Apify actor for that zone
- Polls for completion (max 5 min)
- Upserts results into `properties_for_sale` / `properties_for_rent`
- Updates job status + zone metadata
- Calls `refresh_search_views()` on success

#### Stage 3: pg_cron Scheduling

Using the insert tool (not migration — contains project-specific URLs):
- Schedule `queue_due_scrapes()` hourly
- Schedule `process-scrape-job` edge function call every minute via `pg_net`
- Schedule `deactivate_stale_properties()` daily at 04:00

#### Stage 4: Admin Dashboard Overhaul

**`src/pages/Admin.tsx`** — complete redesign with tabs:

**Tab 1: Leads** (existing, enhanced)
- Add "buy" type filter (pull from `buy_analyses` too)
- Show buy analyses alongside sell/rent leads

**Tab 2: Zones**
- Table of all zones with: name, tier, last_scraped_at, total_properties, status
- Color-coded staleness (green = fresh, yellow = aging, red = stale)
- "Scrape Now" button per zone (calls `scrape-properties` edge function)
- Inline add/edit zone capability

**Tab 3: Scrape Jobs**
- Recent jobs list with status, zone, items found/upserted, duration, errors
- Filter by status (pending/running/completed/failed)
- Auto-refresh

**Tab 4: System Health**
- Calls `system_health_check()` RPC
- Cards: Total Properties, Active Properties, Stale Zones, Today's Valuations, Pending Jobs, Failed Jobs (24h)
- Visual indicators (green/yellow/red)

---

### Files Created
- `supabase/functions/process-scrape-job/index.ts`

### Files Modified
- `src/pages/Admin.tsx` — full redesign with tabs
- Database migration (new tables, views, functions)

### Secrets Required
- `APIFY_API_TOKEN` — already configured
- `LOVABLE_API_KEY` — already configured

### Implementation Order
1. Database migration (schema + views + functions)
2. Insert zone data
3. `process-scrape-job` edge function
4. pg_cron scheduling
5. Admin dashboard UI

