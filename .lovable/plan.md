

# Show Agent Sales on Map — Fix Missing Coordinates

## Problem

The `AgentPropertyMap` component is already integrated on both the company profile page (`AgentProfile.tsx`) and individual team member pages (`TeamMemberProfile.tsx`). However, the map never renders because **none of the `agent_sales` records have `latitude`/`longitude` values** — the geocoding step in the enrich function requires a Google Maps API key secret (`GOOGLE_MAPS_API_KEY`) and may not have run.

The single sale in the database has `address_text: "Calle Algorta"` and `city: "Marbella"` but null coordinates.

## Fix — Two Parts

### Part 1: Geocode sales that have addresses but no coordinates

Add a fallback geocoding step in the frontend when loading sales for the agent profile. When `agent_sales` rows have `city`/`address_text` but no `latitude`/`longitude`, use the Google Maps Geocoding API (key already in `src/config/google-maps.ts`) to resolve coordinates client-side and cache them back to the database via a lightweight edge function or just display them in-memory.

**Recommended approach**: Create a small utility that, when `AgentPropertyMap` receives sales with missing coordinates, geocodes them client-side using the existing Google Maps API key (already public/domain-restricted) and passes the resolved positions to the map. No database update needed — just enrich at render time.

### Part 2: Ensure the enrich edge function geocodes on save

Check that the `GOOGLE_MAPS_API_KEY` secret is set for edge functions so that newly added sales get geocoded during enrichment. If not set, add it.

## Files to change

| File | Change |
|------|--------|
| `src/components/agent/AgentPropertyMap.tsx` | Add client-side geocoding fallback: for sales with `city`/`address_text` but no coordinates, batch-geocode using Google Maps API and merge results before rendering markers |
| `src/components/agent/AgentPropertyMap.tsx` | Update the `PropertyMarker` interface to include `address_text` so geocoding has input data |
| `src/pages/AgentProfile.tsx` | Pass `address_text` in the sales data mapped to `AgentPropertyMap` |
| `src/pages/TeamMemberProfile.tsx` | Pass `address_text` in the sales data mapped to `AgentPropertyMap` |

Additionally, verify the `GOOGLE_MAPS_API_KEY` edge function secret is configured for future enrichment.

## Technical details

- The Google Maps Geocoding API is called with `address_text + city + "Spain"` 
- Results are cached in a `useRef` map keyed by sale ID to avoid re-geocoding on re-renders
- Sales without coordinates AND without address data are excluded from the map
- The existing map component already handles the `markers.length === 0` empty state gracefully

