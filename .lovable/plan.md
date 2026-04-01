

# On-Demand Resales Online Fetch During Valuation

## Problem
Currently the Resales Online sync is a bulk operation triggered manually from admin. The user wants to fetch properties **only when someone requests a valuation**, keeping the data volume low and ensuring fresh comparables.

## Approach
Modify the `calculate-valuation` edge function to call the Resales Online API directly when it finds few comparables in the database. The API doesn't support GPS-radius search, but it does return area/location data — so we fetch a page of properties from the same filter, upsert them into `properties`, then re-query comparables.

Since the API returns ALL properties in a filter (not location-filtered), we'll fetch a small batch (1–2 pages = 50–100 properties) and rely on PostGIS `find_comparables_with_fallback` to pick the relevant nearby ones.

## Changes

### 1. New helper function in `calculate-valuation/index.ts`
Add an `async function fetchResalesNearby(...)` that:
- Reads `RESALES_CONTACT_ID` and `RESALES_API_KEY` from env
- Calls `SearchProperties` with the sale or rent filter (filter 1 for sale, 3 for rent)
- Fetches just 1 page (50 properties) to keep it fast
- Transforms and upserts them into `properties` table (same transform logic as the sync function)
- Refreshes the `active_listings` materialized view

### 2. Integrate into valuation flow
After the initial `find_comparables_with_fallback` call (line ~182), check if we got fewer than 5 comparables. If so:
- Call `fetchResalesNearby()` to import a batch of Resales Online properties
- Re-run `find_comparables_with_fallback` with the now-enriched database
- This is a one-time "warm-up" — subsequent valuations in the same area will already have data

### 3. Reuse transform logic
Copy the essential transform functions (`mapPropertyType`, `extractFeatures`, `transformProperty`) from `resales-online-sync` into `calculate-valuation` (since edge functions can't import across function folders). Keep them compact.

### 4. No UI changes needed
This is entirely backend — the user experience stays the same, just with better comparable data.

## Technical Details

```text
User submits valuation
  → calculate-valuation edge function
    → Insert lead (status: processing)
    → find_comparables_with_fallback (PostGIS)
    → IF comparables < 5:
        → Fetch 50 properties from Resales Online API
        → Upsert into properties table
        → Refresh active_listings materialized view
        → Re-run find_comparables_with_fallback
    → Continue with valuation calculation
```

## Files Modified
- `supabase/functions/calculate-valuation/index.ts` — add Resales Online on-demand fetch + re-query logic

