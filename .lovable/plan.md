

# Create `sell-valuation` Edge Function

## File to create

`supabase/functions/sell-valuation/index.ts`

## What it does

A POST endpoint that accepts property details (municipality, type, size, rooms, features), scrapes Idealista for comparable listings via ScrapingBee, filters them, runs the valuation engine, and returns an estimated market value with comparables.

## Flow

1. CORS preflight handling
2. Validate required fields: `municipality`, `sizeM2`, `rooms`
3. Look up municipality slug from `MUNICIPALITY_SLUGS`
4. Map `propertyType` → Idealista URL format (`pisos`, `aticos`, `chalets`, `viviendas`)
5. Build size filters (±30%) and price filters (base €3000/m² ±50%)
6. Call `buildIdealistaSearchUrl()` → `fetchWithScrapingBee()` with `SCRAPINGBEE_API_KEY` from env
7. Parse HTML with `parseSearchResults()`
8. Filter: must have size+rooms, rooms ±1, size ±30%
9. Run `calculateValuation()` from shared engine
10. Return JSON with `valuation`, `comparables` (max 15), and `meta`

## Imports from shared modules

- `fetchWithScrapingBee`, `buildIdealistaSearchUrl` from `../_shared/scrapingbee-client.ts`
- `parseSearchResults`, `MUNICIPALITY_SLUGS` from `../_shared/idealista-parser.ts`
- `calculateValuation`, `ValuationInput`, `ComparableProperty` from `../_shared/valuation-engine.ts`

## Response shape

Maps `ValuationResult` fields to the response format specified in the prompt (estimatedValue, estimatedLow/High, confidence, featureAdjustments with label/percent/amount, etc.). Comparables capped at 15.

## Technical notes

- Uses CORS headers from `@supabase/supabase-js/cors`
- Reads `SCRAPINGBEE_API_KEY` via `Deno.env.get()`
- No frontend changes, no database changes

