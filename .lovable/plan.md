

## Plan: Streamlined Sequential Location Flow

The location input becomes a **two-phase sequential process** — not three options shown at once.

### Flow

```text
PHASE 1: Address Input
┌─────────────────────────────────┐
│  🔍 Type your address...        │  ← autocomplete search
│  ┌─────────────────────────────┐│
│  │ 📍 Use my current location  ││  ← appears as first suggestion
│  │ 📍 Calle Luna 12, Marbella  ││     when dropdown opens
│  │ 📍 Calle Luna 5, Estepona   ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
         ↓ user picks one
PHASE 2: Verify on Map
┌─────────────────────────────────┐
│  ✓ Calle Luna 12, Marbella     │  ← confirmed address, editable
│  ┌─────────────────────────────┐│
│  │                             ││
│  │      Map with pin 📌        ││  ← draggable pin, reverse geocodes
│  │                             ││
│  └─────────────────────────────┘│
│  [Confirm Location]             │
└─────────────────────────────────┘
```

Phase 1 and Phase 2 happen in the same space — Phase 2 replaces Phase 1 after selection.

### Changes by File

**1. `src/types/valuation.ts`**
- Add `latitude?: number` and `longitude?: number` to `AddressData`, `SellValuationData`, `RentValuationData`
- Add to initial data objects

**2. `src/components/shared/MapboxAddressInput.tsx` — Two-phase component**
- Add internal state: `phase: "search" | "verify"`
- **Phase "search"**: Current autocomplete, but inject a **"Use my current location"** item as the first suggestion in the dropdown (always visible when the input is focused/has < 3 chars). Uses `navigator.geolocation` → reverse geocode via Mapbox → fills address + moves to verify phase.
- **Phase "verify"**: Search input becomes a confirmed address display. Below it, render an embedded Mapbox GL JS map centered on the resolved coordinates with a **draggable marker**. On drag end → reverse geocode new position → update address fields. A "Confirm Location" button finalizes.
- Add props: `onCoordinatesChange?: (lat: number, lng: number) => void`, `onLocationConfirmed?: () => void`
- Remove `country=es` filter from geocoding URL (keep proximity bias for Spain)
- Add `center` array from feature geometry for map placement

**3. Install `mapbox-gl` package**
- Required for the interactive verification map

**4. `src/components/sell/SellLocationStep.tsx` & `src/components/rent/RentLocationStep.tsx`**
- Remove the Quick City Select buttons and standalone urbanization input
- Pass lat/lng and confirmation callback through to `MapboxAddressInput`
- Urbanization is auto-filled from geocoding (already happens)

**5. Mapbox token — required secret**
- `VITE_MAPBOX_ACCESS_TOKEN` must be added as a publishable key in the codebase (it's a client-side token, safe to store in code)
- Will prompt you for this before proceeding

**6. DB migration**
- Add `latitude double precision` and `longitude double precision` columns to `leads_sell` and `leads_rent`

**7. `src/pages/SellValuation.tsx` & `src/pages/RentValuation.tsx`**
- Pass lat/lng values to the database insert

### What stays unchanged
- ValuationTicketCard (all modes)
- Result pages
- All other form steps
- Index.tsx

