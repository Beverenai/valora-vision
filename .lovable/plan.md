

# Add Sale Date to Map Popups + Admin Valuations Map

## Three changes needed

### 1. Show sale date in map popups (AgentPropertyMap + NearbyPropertyMap)

The `AgentPropertyMap` and `NearbyPropertyMap` components already render popups with photo, type, bedrooms, city, and price — but not the sale date. The `sale_date` field is already available in the data.

**AgentPropertyMap.tsx**:
- Add `sale_date: string | null` to the `PropertyMarker` interface
- Add sale date line to the popup HTML: `Sold: Mar 2025`

**NearbyPropertyMap.tsx**:
- Add `sale_date` to the `SaleMarker` interface and the RPC data mapping
- Add sale date line to the popup HTML
- Update the `find_nearby_agent_sales` RPC return type if needed (it returns `SETOF agent_sales` so `sale_date` is already included)

### 2. Translate remaining Spanish strings in AgentPropertyMap

The fallback text still says "UBICACIÓN DE VENTAS" and "Mapa de propiedades disponible próximamente" — change to English: "SALES LOCATIONS" and "Property map available soon". Also fix popup text: "Propiedad" → "Property", "dormitorios" → "bedrooms".

### 3. Admin Valuations Map (new section in Admin.tsx)

Add a new "Map" tab/section to the Admin page that shows all completed valuations on a Mapbox map. This creates a geographic overview of where valuations have been requested.

**Implementation**:
- Add a new `MapTab` component inside `Admin.tsx`
- Fetch `leads_sell` and `leads_rent` where `status = 'completed'` and `latitude`/`longitude` are not null
- Render a Mapbox map with markers (blue for sell, green for rent)
- Popup shows: address, city, estimated value, date, property type
- Add "map" to the `AdminSection` type and sidebar navigation

**Data**: The `leads_sell` and `leads_rent` tables already have `latitude`, `longitude`, `estimated_value`, `address`, `city`, `property_type`, and `created_at` columns.

## Files to change

| File | Change |
|------|--------|
| `src/components/agent/AgentPropertyMap.tsx` | Add `sale_date` to interface + popup; translate Spanish → English |
| `src/components/shared/NearbyPropertyMap.tsx` | Add `sale_date` to interface + popup |
| `src/pages/Admin.tsx` | Add "Map" section with valuations Mapbox map |
| `src/components/admin/AdminSidebar.tsx` | Add "map" to section type + nav item |

No database changes needed — all data already exists.

