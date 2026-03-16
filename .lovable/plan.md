

## Plan: Property Data Ingestion Pipeline via External APIs

### Current State

The valuation engine queries `properties_for_sale` and `properties_for_rent` tables using PostGIS `find_sale_comparables` / `find_rent_comparables` RPCs. The `short_term_rentals` table exists but isn't used in valuations yet. All tables are currently empty or manually populated — there's no automated data ingestion.

### What We'll Build

A weekly data ingestion pipeline using RapidAPI providers to populate the three property tables from Idealista (sales + long-term rentals) and Airbnb/VRBO (short-term rentals).

### Architecture

```text
┌──────────────────────┐     ┌─────────────────────┐
│  pg_cron (weekly)    │────▶│  scrape-properties   │
│  Triggers per zone   │     │  (Edge Function)     │
└──────────────────────┘     └─────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
           RapidAPI Idealista   RapidAPI Idealista   RapidAPI Airbnb
           (Sale listings)      (Rent listings)      (STR data)
                    │                  │                  │
                    ▼                  ▼                  ▼
           properties_for_sale  properties_for_rent  short_term_rentals
```

### Implementation Steps

**1. Edge Function: `scrape-properties`**

A single edge function that accepts a zone/location and fetches data from three sources:

- **Idealista Sales** — RapidAPI endpoint for sale listings. Parses price, size, beds, baths, coordinates, images, features. Upserts into `properties_for_sale` by `external_id + source`.
- **Idealista Rentals** — Same API, rental operation. Upserts into `properties_for_rent`.
- **Airbnb/VRBO** — RapidAPI endpoint for short-term rental data (daily rates, occupancy, reviews). Upserts into `short_term_rentals`.

Each source is wrapped in try/catch so one failure doesn't block others. The function updates `scrape_zones.last_scraped_at` after completion.

**2. API Keys (Secrets)**

We'll need RapidAPI keys configured as secrets:
- `RAPIDAPI_KEY` — single key for all RapidAPI endpoints

**3. Weekly Schedule via pg_cron**

A cron job iterates active `scrape_zones` and calls the edge function for each zone. Runs weekly.

**4. Update `calculate-valuation` for Short-Term Rentals**

Enhance the existing edge function to also query `short_term_rentals` when generating rent valuations, adding seasonal rate estimates and occupancy data.

**5. Populate `scrape_zones` with Initial Data**

Insert Costa del Sol zones (Marbella, Estepona, Fuengirola, Malaga, etc.) with their Idealista location IDs.

### Technical Details

- **Deduplication**: Upsert on `(external_id, source)` unique constraint (need to add this to `properties_for_sale` and `properties_for_rent`)
- **Location point**: Compute `location_point` from lat/lng on insert using `ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography`
- **Rate limiting**: Process zones sequentially with delays between API calls
- **Data freshness**: `scraped_at` timestamp updated on each upsert; comparables RPC already filters `scraped_at > NOW() - 90 days`

### Files

- `supabase/functions/scrape-properties/index.ts` — new edge function
- `supabase/functions/calculate-valuation/index.ts` — add STR data to rent valuations
- DB migration: add unique constraints on `(external_id, source)` for sale/rent tables
- DB migration: add INSERT policies for service role on `properties_for_sale`, `properties_for_rent`, `short_term_rentals`

### Next Steps After Implementation

Once the pipeline is built, you'll need to:
1. Add the `RAPIDAPI_KEY` secret
2. Choose specific RapidAPI providers (I'll research the best ones for Spanish property data)
3. Seed the `scrape_zones` table with target locations
4. Test with a single zone before enabling the weekly schedule

