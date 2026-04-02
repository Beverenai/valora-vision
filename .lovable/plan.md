

# Auto-Enrich Listing Links via Firecrawl + Sales Map on Valuation Results

## What This Does

1. **When an agent pastes an Idealista/Fotocasa link** in the "Add Sale" dialog, a backend function scrapes the listing page using Firecrawl to auto-fill: photo, property type, bedrooms, bathrooms, size, price, city, address, and critically **latitude/longitude** — so the sale appears on the map.

2. **On the Sell Result page**, show a map with the user's valuation property pinned at center, plus all nearby `agent_sales` within a radius, so sellers can see real sold properties around them.

## Implementation

### 1. New Edge Function: `enrich-sale-listing/index.ts`

- Accepts `{ sale_id, listing_url }` 
- Uses Firecrawl to scrape the URL with `formats: ['markdown', 'json']` and a JSON schema to extract structured data (price, bedrooms, bathrooms, size, property_type, address, city, lat, lng, image_url, description)
- Updates the `agent_sales` row with the extracted fields using service role key
- Sets `enriched_title` and `enriched_description` from scraped content
- Returns `{ success: true, enriched_fields: [...] }`

### 2. Update `AddSaleDialog.tsx` — Link Tab

After inserting the sale row (which returns the new `id`), invoke `supabase.functions.invoke("enrich-sale-listing", { body: { sale_id, listing_url } })` in the background. Show a toast: "Listing details are being imported...". The dialog closes immediately; enrichment happens async.

### 3. New RPC Function: `find_nearby_agent_sales`

SQL function that finds `agent_sales` within a given radius of a lat/lng point:
```sql
CREATE FUNCTION find_nearby_agent_sales(
  p_lat NUMERIC, p_lng NUMERIC, p_radius_km NUMERIC DEFAULT 5, p_limit INT DEFAULT 50
) RETURNS SETOF agent_sales
```
Uses the existing PostGIS `location_point` column and GIST index.

### 4. New Component: `NearbyPropertyMap.tsx`

A map component for the valuation result page that:
- Pins the user's property at center (distinct color/icon)
- Fetches nearby sold properties via the RPC
- Shows agent sale markers with popups (photo, price, type)
- Reuses the Mapbox lazy-loading pattern from `AgentPropertyMap`

### 5. Update `SellResult.tsx`

Add the `NearbyPropertyMap` section after the valuation card, before the agent matching section. Only renders when the lead has lat/lng coordinates. Lazy-loaded with Suspense.

## Technical Details

| Item | Detail |
|------|--------|
| Firecrawl | Already connected. Uses `FIRECRAWL_API_KEY` env var in edge function |
| JSON extraction | Firecrawl's `formats: [{ type: 'json', schema }]` for structured data |
| Geocoding fallback | If Firecrawl doesn't return lat/lng, use the address + Google Geocoding API |
| `agent_sales` columns | All needed columns already exist: `latitude`, `longitude`, `location_point` (auto-set by trigger), `photo_url`, `enriched_title`, `enriched_description` |
| Map | Reuses Mapbox with `VITE_MAPBOX_TOKEN` |

## Files

| File | Action |
|------|--------|
| `supabase/functions/enrich-sale-listing/index.ts` | Create — Firecrawl scraping + DB update |
| `src/components/dashboard/AddSaleDialog.tsx` | Edit — call enrichment after insert |
| `supabase/migrations/` | Create — `find_nearby_agent_sales` RPC |
| `src/components/shared/NearbyPropertyMap.tsx` | Create — valuation result map |
| `src/pages/SellResult.tsx` | Edit — add nearby sales map section |

