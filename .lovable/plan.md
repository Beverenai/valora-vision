

# Fix Build Error + Switch Maps from Mapbox to Google Maps

## Two things to address

### 1. Fix build error (quick)
The `AgentProfile.tsx` references `teamMembers` but the state variable is called `team`. Replace `teamMembers` with `team` on lines 524, 527.

### 2. Switch all maps to Google Maps (already configured)
The project already has a Google Maps API key in `src/config/google-maps.ts` and uses `@googlemaps/js-api-loader` for the address input. Currently, `AgentPropertyMap`, `NearbyPropertyMap`, and the Admin valuation map all use Mapbox. We'll replace them with Google Maps JS API using the same loader pattern already in `GoogleAddressInput.tsx`.

**What changes per component:**

**AgentPropertyMap.tsx** — Replace Mapbox with Google Maps:
- Use `@googlemaps/js-api-loader` with the existing API key
- Create a `google.maps.Map` with `light` map style
- Use `google.maps.marker.AdvancedMarkerElement` (or standard `Marker`) with terracotta-colored pins
- Use `google.maps.InfoWindow` for popups showing photo, type, beds, city, price, sale date
- Auto-fit bounds when multiple markers exist

**NearbyPropertyMap.tsx** — Same conversion:
- Replace Mapbox initialization with Google Maps
- Blue marker for user's property, terracotta for nearby sales
- InfoWindows with the same content (photo, type, beds, price, date, verified badge)

**Admin.tsx (ValuationsMapTab)** — Same conversion:
- Blue markers for sell valuations, green for rent
- InfoWindows with address, value, date, type

**Geocoding in edge function** — Switch from Mapbox to Google Geocoding API:
- Use `https://maps.googleapis.com/maps/api/geocode/json?address=...&key=...`
- Need `GOOGLE_MAPS_API_KEY` as a server-side secret (same key value as the frontend one)

### Files to change

| File | Change |
|------|--------|
| `src/pages/AgentProfile.tsx` | Fix `teamMembers` → `team` (build error) |
| `src/components/agent/AgentPropertyMap.tsx` | Replace Mapbox with Google Maps JS API |
| `src/components/shared/NearbyPropertyMap.tsx` | Replace Mapbox with Google Maps JS API |
| `src/pages/Admin.tsx` | Replace Mapbox map in ValuationsMapTab with Google Maps |
| `supabase/functions/enrich-sale-listing/index.ts` | Use Google Geocoding API instead of Mapbox for address→coordinates |

### No new dependencies needed
`@googlemaps/js-api-loader` is already installed. The Google Maps API key is already in the codebase. For the edge function geocoding, we'll need the same API key as a server-side secret (`GOOGLE_MAPS_API_KEY`).

