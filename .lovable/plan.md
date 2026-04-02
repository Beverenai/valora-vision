

# Update `buy-analysis` with sell-valuation fixes

## Changes to `supabase/functions/buy-analysis/index.ts`

1. **Property type mapping** (line 26): Change `apartment: "pisos"` → `apartment: "viviendas"`, `duplex: "pisos"` → `duplex: "viviendas"`, `studio: "pisos"` → `studio: "viviendas"`

2. **ScrapingBee settings for detail scrape** (line 63-64): Change to `renderJs: true, premiumProxy: true, stealthProxy: true, countryCode: "es", wait: 3000`

3. **ScrapingBee settings for search scrape** (line 109-110): Same: `renderJs: true, premiumProxy: true, stealthProxy: true, countryCode: "es", wait: 3000`

4. **Remove price filters from search URL** (lines 97-104): Remove `minPrice`/`maxPrice` variables and their usage in `buildIdealistaSearchUrl()`. Keep only `minSize`/`maxSize`.

## No changes needed to shared files

The `scrapingbee-client.ts` already has `stealthProxy` and `wait` support (added during sell-valuation fixes).

## Test after deploy

Call `POST /functions/v1/buy-analysis` with `{ "url": "https://www.idealista.com/inmueble/106583498/" }`.

