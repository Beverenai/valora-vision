

## Plan: Switch from Mapbox to Google Maps

Replace Mapbox geocoding + map with Google Places Autocomplete + Google Maps JS API. Same two-phase flow (Search → Verify), just different provider.

### Changes

**1. Rename & rewrite `src/components/shared/MapboxAddressInput.tsx` → `GoogleAddressInput.tsx`**
- **Phase 1 (Search)**: Use Google Places Autocomplete API (`/maps/api/place/autocomplete/json` via the JS library `google.maps.places.AutocompleteService`) for suggestions. Keep the "Use my current location" as first dropdown item (browser Geolocation → Google Geocoder reverse lookup).
- **Phase 2 (Verify)**: Embed a `google.maps.Map` with a draggable `google.maps.Marker`. On drag end → `google.maps.Geocoder.geocode({location})` to update address fields.
- Load the Google Maps JS SDK via a `<script>` tag or dynamic import with `@googlemaps/js-api-loader`
- Parse `place.address_components` to extract street, city, province, country, urbanization
- Token read from `VITE_GOOGLE_MAPS_API_KEY`

**2. Install `@googlemaps/js-api-loader`**
- Lightweight loader for Google Maps JS API — avoids raw script tag management

**3. Update imports in `SellLocationStep.tsx` and `RentLocationStep.tsx`**
- Change `MapboxAddressInput` → `GoogleAddressInput`

**4. Remove `mapbox-gl` dependency**
- No longer needed

**5. Store the API key**
- `VITE_GOOGLE_MAPS_API_KEY` — this is a publishable client-side key, stored directly in the codebase

### Interface stays identical
- Same `AddressData` type, same `onChange` callback, same `onLocationConfirmed` prop
- Same two-phase UX: search dropdown → map verification → confirm button

### Files changed
- `src/components/shared/GoogleAddressInput.tsx` (new, replaces MapboxAddressInput)
- `src/components/shared/MapboxAddressInput.tsx` (delete)
- `src/components/sell/SellLocationStep.tsx` (update import)
- `src/components/rent/RentLocationStep.tsx` (update import)
- `package.json` (add `@googlemaps/js-api-loader`, remove `mapbox-gl`)

