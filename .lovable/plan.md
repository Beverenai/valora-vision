

# Create ScrapingBee Shared Utilities for Edge Functions

## Overview

Create three shared utility files under `supabase/functions/_shared/` that handle ScrapingBee API communication, Idealista HTML parsing, and property valuation calculations. Also add the `SCRAPINGBEE_API_KEY` secret.

## Step 0: Add Secret

Use the `add_secret` tool to store `SCRAPINGBEE_API_KEY` with the value provided.

## Files to Create

### 1. `supabase/functions/_shared/scrapingbee-client.ts`
- `fetchWithScrapingBee(url, apiKey, options)` — calls ScrapingBee API with configurable proxy, JS rendering, country code, and timeout (90s)
- `buildIdealistaSearchUrl(params)` — constructs Idealista search URLs from operation, property type, municipality slug, price/size/room filters, and pagination
- Default: `renderJs=false`, `premiumProxy=true`, `countryCode="es"`

### 2. `supabase/functions/_shared/idealista-parser.ts`
- Types: `ParsedProperty`, `PropertyFeatures`, `ParsedDetailProperty`
- `parseSearchResults(html)` — extracts property listings from Idealista search page HTML using regex on article elements (property code, price in Spanish format, size, rooms, bathrooms, thumbnail, property type detection, feature detection)
- `parsePropertyDetail(html)` — extracts full detail from a single listing page (images, GPS coords, energy rating, construction year, contact info)
- `MUNICIPALITY_SLUGS` — mapping of city names to Idealista URL slugs (Marbella, Estepona, Málaga, etc.)
- All parsing uses regex (no DOM parser needed in Deno)

### 3. `supabase/functions/_shared/valuation-engine.ts`
- `calculateValuation(input, comparables)` — computes estimated value using:
  - MAD-based outlier removal on price/m² values
  - Median price/m² × target size as base estimate
  - Feature adjustments (pool +10%, sea views +20%, garage +5%, etc.) applied only when target differs significantly from comparable set (>70% or <30% thresholds)
  - Confidence levels based on comparable count (high/medium/low/insufficient)
  - Range of ±15%
- `calculateBuyAnalysis(askingPrice, input, comparables)` — extends valuation with:
  - Price deviation percentage
  - Price score (below_market / good_value / fair_price / slightly_above / above_market)
  - Color codes and negotiation hints with actual € amounts

## Technical Notes

- Files are pure utility modules (no HTTP handlers) — they export functions for use by edge functions
- Consistent with existing patterns in `calculate-valuation/index.ts` (same MAD filtering, feature adjustment approach) but extracted into reusable modules
- No frontend changes
- No database changes

