

# Add Rent as Third Homepage Mode

## What Changes

Expand the homepage from 2 modes (`sell | buy`) to 3 modes (`sell | rent | buy`). Rent navigates to the homepage with `/?mode=rent` instead of `/rent/valuation`. The SkyToggle (binary Sell/Buy) stays as the primary toggle, and Rent mode is activated only via navbar link or direct URL.

## Changes

### 1. Update Navbar (`src/components/Navbar.tsx`)
- Change Rent href from `/rent/valuation` to `/?mode=rent`
- Change Rent CTA href similarly

### 2. Expand Index.tsx state to support 3 modes
- Change `valuationType` type from `"sell" | "buy"` to `"sell" | "rent" | "buy"`
- Add `modeParam === "rent"` handling in the `useEffect`
- Add rent-specific content constants:
  - `REPORT_FEATURES_RENT` (rental income estimate, comparable rents, area rental trends, etc.)
  - `TESTIMONIALS_RENT`
  - Rent hero copy: "How much rent can your property earn?" / "Get a rental income estimate in under 2 minutes"
  - Rent showcase data for the preview card
- Add `isRent` boolean alongside `isSell` / `isBuy`
- Rent mode uses the same address input as Sell (not URL input like Buy)
- On submit in rent mode, navigate to `/rent/valuation` with prefilled address (same pattern as sell navigates to `/sell/valuation`)
- Rent uses a green/teal accent color to differentiate from sell (terracotta) and buy (blue)
- Steps text, icons, and previews adapt for rent (similar to sell flow: enter address → property details → get estimate)

### 3. SkyToggle stays binary
- The SkyToggle on the hero card keeps toggling between Sell and Buy only
- When user arrives via `/?mode=rent`, the toggle is hidden or replaced with a simple "Rental Estimate" label
- Switching back to sell/buy via the toggle resets to the normal flow

### Files Modified
- `src/components/Navbar.tsx` — Rent href → `/?mode=rent`
- `src/pages/Index.tsx` — Add rent as third mode with content, hero, and navigation logic

