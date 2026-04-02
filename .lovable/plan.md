

# Create `buy-analysis` Edge Function

## File to create

`supabase/functions/buy-analysis/index.ts`

## What it does

Accepts an Idealista listing URL, scrapes the property detail page, finds comparables via a search scrape, and returns a Price Score analysis comparing asking price to estimated market value.

## Flow

1. CORS preflight
2. Validate URL contains `idealista.com/inmueble/`, extract property code
3. Scrape detail page via `fetchWithScrapingBee()` → parse with `parsePropertyDetail()`
4. Detect municipality from parsed address/title using `MUNICIPALITY_SLUGS`
5. Scrape comparables search page → parse with `parseSearchResults()`
6. Filter comparables (exclude target, ±1 rooms, ±30% size)
7. Run `calculateBuyAnalysis(askingPrice, input, comparables)` from valuation engine
8. Return structured response with property, analysis, comparables (max 10), and meta

## Response mapping

Maps `BuyAnalysisResult` fields to the prompt's response format:
- `priceRangeLow` → `estimatedLow`, `priceRangeHigh` → `estimatedHigh`
- `pricePerM2` → `estimatedPricePerM2`, `medianPricePerM2` → `areaMedianPricePerM2`
- `confidenceLevel` → `confidence`
- `priceScore.score/label/color/deviationPercent` → flat fields
- Each comparable gets a `priceComparison` field (cheaper/similar/more_expensive/unknown)

## Error handling

- 400: missing/invalid URL, non-Idealista portal
- 422: parsing failed (removed listing, no price/size)
- 502: ScrapingBee error
- 500: unexpected error

## Imports

- `fetchWithScrapingBee`, `buildIdealistaSearchUrl` from `../_shared/scrapingbee-client.ts`
- `parsePropertyDetail`, `parseSearchResults`, `MUNICIPALITY_SLUGS` from `../_shared/idealista-parser.ts`
- `calculateBuyAnalysis`, `ValuationInput`, `ComparableProperty` from `../_shared/valuation-engine.ts`

## Secrets

`SCRAPINGBEE_API_KEY` is already configured — no new secret needed.

## Notes

- No frontend changes, no database changes
- Uses ~10 ScrapingBee credits per call (2 requests, no JS rendering)

