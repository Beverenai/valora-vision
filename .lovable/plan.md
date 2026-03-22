

## Plan: Fix the Two Broken Links in the Scraping Pipeline

### Problem
The backend infrastructure is correctly set up (tables, functions, cron schedules, edge function) but two issues prevent anything from actually running:

1. **Cron job uses wrong function name**: `extensions.http_post()` instead of `net.http_post()` — fails every 2 minutes
2. **Admin "Scrape Now" blocked by RLS**: `scrape_jobs` only allows `service_role` to insert, but the admin button uses the anon client

### Fixes

**Fix 1: Replace the broken cron job (database operation)**
- Unschedule job #4 (`process-scrape-queue`)
- Re-create it using `net.http_post()` instead of `extensions.http_post()`

**Fix 2: Add RLS policy for anon insert on `scrape_jobs`** (migration)
- Add: `CREATE POLICY "Anyone can create scrape jobs" ON scrape_jobs FOR INSERT TO public WITH CHECK (true);`
- This matches the pattern used for `leads_sell`, `leads_rent`, `buy_analyses`

**Fix 3: Route admin "Scrape Now" through the edge function** (alternative to Fix 2)
Instead of inserting directly into `scrape_jobs` from the client (which hits RLS), change the admin button to call `process-scrape-job` with the `zone_id` in the body, and have the edge function create the job itself. This is more secure — no public insert on `scrape_jobs`.

I recommend **Fix 1 + Fix 3** (fix the cron + route scrapes through the edge function).

### Changes

**Database**: Unschedule broken cron job, re-create with `net.http_post()`

**Migration**: No new RLS policy needed (keep `scrape_jobs` insert restricted to service_role)

**`supabase/functions/process-scrape-job/index.ts`**: Accept optional `{ zone_id }` in request body. If provided, insert a pending job for that zone (using service_role client) before processing.

**`src/pages/Admin.tsx`**: Change `triggerScrape()` to only call `supabase.functions.invoke("process-scrape-job", { body: { zone_id: zone.id } })` — remove the direct `scrape_jobs` insert.

### Files Modified
- `supabase/functions/process-scrape-job/index.ts` — accept optional `zone_id` param to create + process job
- `src/pages/Admin.tsx` — simplify triggerScrape to single edge function call

### Database Operations
- Unschedule cron job #4, re-create with correct `net.http_post()` syntax

