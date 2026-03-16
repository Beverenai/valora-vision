

## Plan: Replace Plain Address Input on Landing Page with Google Autocomplete

### Problem
The landing page (`/`) uses a plain `<input>` text field for the address (lines 117-143 in `Index.tsx`). It has no autocomplete, no suggestions, no map — it just passes raw text to `/sell/valuation`. Users type an address and nothing happens because there's no feedback.

### Solution
Replace the plain `<input>` on the landing page with the existing `GoogleAddressInput` component. When the user selects an address and confirms the location, navigate directly to `/sell/valuation` with the full address data (including lat/lng), which will skip the location step or pre-populate it.

### Changes

**`src/pages/Index.tsx`**:
1. Replace the `AddressBlock` component's plain `<input>` with `GoogleAddressInput`
2. Store full address data (streetAddress, city, province, country, lat, lng) in state instead of just a string
3. When `onLocationConfirmed` fires, navigate to `/sell/valuation` with the address data pre-populated
4. Since address data will include lat/lng from the map confirmation, the valuation wizard can start at step 1 (Details) instead of step 0

**`src/pages/SellValuation.tsx`** (minor):
- If `location.state` includes `latitude` and `longitude`, start at step 1 instead of step 0 (address already confirmed)

### Flow After Fix
1. User lands on `/` → sees Google-powered address search in the hero
2. Types address → gets autocomplete suggestions
3. Selects suggestion → sees map with pin → confirms location
4. Navigates to `/sell/valuation` at step 1 (Details) with address pre-filled

