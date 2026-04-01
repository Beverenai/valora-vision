

# Location-Aware On-Demand Resales Online Fetch

## Problem
The current `fetchResalesOnDemand` in `calculate-valuation` fetches 50 random properties from the entire Resales Online filter (sale/rent) with no location filtering. Since the database starts empty, these random properties are unlikely to be near the valuation address, so `find_comparables_with_fallback` still returns nothing useful.

## Solution
Pass the valuation's city/area to the Resales Online API using the `P_Area` and/or `P_Location` query parameters, and also filter by property type using `P_PropertyType`. This focuses the fetch on properties relevant to the valuation request.

## Changes in `supabase/functions/calculate-valuation/index.ts`

### 1. Update `fetchResalesOnDemand` signature
Change from `(supabase, operation)` to `(supabase, operation, city, propertyType)` so it receives location and type context from the valuation request.

### 2. Add location + type params to API call
Add these query parameters to the `SearchProperties` request:
- `P_Area` — set to the city/municipality from the valuation (e.g. "Marbella", "Estepona")
- `P_PropertyType` — map the internal property type to Resales Online types (e.g. "apartment" → "Apartment", "villa" → "Villa")

If the city-filtered request returns 0 results, do a second attempt without the area filter as fallback.

### 3. Add `location_point` PostGIS column on upsert
The upserted properties need `location_point` set from their GPS coordinates so `find_comparables_with_fallback` can find them. Add a raw SQL or use the existing trigger/function that sets `location_point` from lat/lng. Check if there's a trigger already — if not, set it via `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.

### 4. Update the call site
Pass `city` and `property_type` from the valuation request body into `fetchResalesOnDemand`.

### 5. Property type mapping for API
Add a reverse mapping function: internal types → Resales Online `P_PropertyType` values (e.g. "apartment" → "Apartments", "villa" → "Villas", "townhouse" → "Town Houses").

## Technical Detail
```text
fetchResalesOnDemand(supabase, "sale", "Marbella", "apartment")
  → GET SearchProperties?...&P_Area=Marbella&P_PropertyType=Apartments
  → If 0 results: retry without P_Area
  → Upsert with location_point from GPS coords
  → Refresh materialized view
```

## Files Modified
- `supabase/functions/calculate-valuation/index.ts` — add location/type params to on-demand fetch

