

# Route Sell & Buy Nav Links to Homepage

## Problem
Clicking "Sell" or "Buy" in the navbar navigates to `/sell/valuation` or `/buy` — separate pages. The user wants these to always start on the homepage, where the SkyToggle already handles both modes.

## Changes

### 1. Update Navbar links (`src/components/Navbar.tsx`)

Change the service link hrefs so Sell and Buy both point to `/` with state to set the toggle mode:

- **Sell** → `/?mode=sell` (or navigate with state)
- **Buy** → `/?mode=buy`
- **Rent** stays at `/rent/valuation` (separate flow)
- CTA buttons follow the same pattern: Sell CTA → `/`, Buy CTA → `/`

Since `<Link>` doesn't easily pass state for mode switching, use query params (`?mode=sell`, `?mode=buy`) which Index.tsx can read.

### 2. Read mode from URL in Index.tsx (`src/pages/Index.tsx`)

On mount, check `searchParams.get("mode")` — if `"buy"`, set `valuationType` to `"buy"`. This way clicking "Buy" in the nav lands on the homepage with the buy toggle active.

### Files Modified
- `src/components/Navbar.tsx` — update Sell/Buy hrefs to `/?mode=sell` / `/?mode=buy`
- `src/pages/Index.tsx` — read `mode` query param to set initial toggle state

