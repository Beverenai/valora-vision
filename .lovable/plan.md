

## Plan: Switch from RapidAPI to Apify for Idealista Scraping

Replace the RapidAPI-based Idealista fetching with Apify's Actor API (`REcGj6dyoIJ9Z7aE6`). The Airbnb/STR scraping via RapidAPI stays as-is (or can also be switched to Apify later).

### Changes

**1. Replace `RAPIDAPI_KEY` with `APIFY_API_TOKEN` secret**
- Add new secret `APIFY_API_TOKEN` for the Apify API token
- Keep `RAPIDAPI_KEY` for Airbnb (or remove if not needed)

**2. Rewrite `fetchIdealistaListings` in `scrape-properties/index.ts`**

Replace the RapidAPI fetch with Apify's REST API:
- **Start Actor run**: `POST https://api.apify.com/v2/acts/REcGj6dyoIJ9Z7aE6/runs?token=...` with the input body (operation, location, maxItems, etc.)
- **Poll for completion**: `GET https://api.apify.com/v2/actor-runs/{runId}?token=...` until status is `SUCCEEDED`
- **Fetch dataset**: `GET https://api.apify.com/v2/datasets/{datasetId}/items?token=...`
- Pass `location_id` from `scrape_zones` as the `location` field in Apify input
- Support both `sale` and `rent` operations

**3. Update `scrape_zones` table**
- The existing `location_id` field already stores Idealista location codes (e.g., `0-EU-ES-29-07-001-067` for Marbella), which maps directly to Apify's `location` input parameter. No schema change needed.

**4. Adjust field mapping in upsert functions**
- The Apify actor returns Idealista data in a slightly different shape than the RapidAPI wrapper. We'll map fields like `propertyCode`, `price`, `size`, `rooms`, `bathrooms`, `latitude`, `longitude`, `url`, etc. The upsert functions already handle most of these field names, but we'll verify and adjust as needed after seeing actual Apify output.

### File
- `supabase/functions/scrape-properties/index.ts` — replace `fetchIdealistaListings` with Apify Actor API calls, update main handler to use `APIFY_API_TOKEN`

### Flow
```text
scrape-properties called with zone
  → POST Apify Actor run (sale)
  → Poll until SUCCEEDED (~1-3 min)
  → GET dataset items
  → upsertSaleListings (existing logic)
  → POST Apify Actor run (rent)
  → Poll until SUCCEEDED
  → GET dataset items
  → upsertRentListings (existing logic)
  → Airbnb via RapidAPI (unchanged)
```

### Important Notes
- Apify Actor runs are async — the edge function will need to poll for completion, which means longer execution time (~2-5 min per zone). Edge functions have a default timeout that may need consideration.
- The `maxItems: 50` input parameter controls how many listings per run.
- No database migration needed — same tables, same upsert logic.

