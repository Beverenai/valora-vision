

## Plan: Replace Google Maps with Mapbox Geocoding

Swap the entire Google Maps address autocomplete system for Mapbox's Geocoding API. No heavy SDK needed — we'll call the Mapbox Geocoding API directly via `fetch` with debounce, keeping the same component interface so all consumers (Index, Sell, Rent, SellLocationStep, RentLocationStep) work without changes.

### What Changes

**1. New shared component: `src/components/shared/MapboxAddressInput.tsx`**
- Self-contained autocomplete input using Mapbox Geocoding v5 API (`https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json`)
- Debounced fetch (300ms), biased to Spain (`country=es`, proximity to Marbella)
- Same props interface as current `GoogleMapsAddressInput`: `addressData`, `onChange`
- Parses Mapbox `context` array to extract city, province, country (Mapbox returns structured place hierarchy in `context`)
- Reads token from `VITE_MAPBOX_ACCESS_TOKEN` env var
- Includes clear button, loading state, suggestion dropdown — same UX as current

**2. Rewrite `src/utils/addressUtils.ts`**
- Remove all `google.maps` and `use-places-autocomplete` imports
- New `parseMapboxFeature(feature)` function that extracts streetAddress, city, province, urbanization from Mapbox's Feature response
- Keep `reconstructAddressFromData` as-is (no Mapbox dependency)
- Remove `geocodeAddress`, `reverseGeocode`, `updateAddressFromGeocode` (Google-specific)

**3. Delete `src/components/shared/GoogleMapsAddressInput.tsx`**
**4. Delete `src/components/shared/AddressSearchInput.tsx`**

**5. Update all consumers** (import swap only — same props):
- `src/pages/Index.tsx` — `MapboxAddressInput`
- `src/pages/Sell.tsx` — `MapboxAddressInput`
- `src/pages/Rent.tsx` — `MapboxAddressInput`
- `src/components/sell/SellLocationStep.tsx` — `MapboxAddressInput`
- `src/components/rent/RentLocationStep.tsx` — `MapboxAddressInput`

**6. Remove Google Maps dependencies from `package.json`:**
- `@react-google-maps/api`
- `use-places-autocomplete` (implicit dep, used via the hook)

**7. API key**: The Mapbox access token is a publishable key (safe for client-side). Store as `VITE_MAPBOX_ACCESS_TOKEN`. Will need user to provide their token.

### Mapbox Feature Parsing Logic

Mapbox geocoding returns features with a `context` array:
```
place_name: "Calle Lola Flores 3, 29602 Marbella, Málaga, Spain"
context: [
  { id: "postcode.123", text: "29602" },
  { id: "place.456", text: "Marbella" },       → city
  { id: "region.789", text: "Málaga" },         → province
  { id: "country.1", text: "Spain" }            → country
]
text: "Calle Lola Flores 3"                     → streetAddress
```

### No new npm dependencies needed
Direct `fetch` calls replace the Google Maps SDK entirely.

