

## Plan: Sky Toggle for Sell/Rent mode + Unified Routes

### Overview
Add the sky-toggle (day/night switch) inside the hero card below the address input to switch between "Property Value" (sell = sun/day) and "Rent Income" (rent = moon/night). The toggle controls page-wide content theming. Consolidate routes to: `/` (home), `/result/:id` (unified result), `/admin`.

### Changes

**1. Install `styled-components` dependency**

**2. Create `src/components/ui/sky-toggle.tsx`**
- Port the provided styled-components toggle as-is
- Add props: `checked: boolean`, `onChange: (checked: boolean) => void`
- Add labels on each side: "Property Value" (left/sun) and "Rent Income" (right/moon)
- Wire the checkbox state to the parent via props instead of internal-only state

**3. Update `src/components/ValuationTicketCard.tsx`**
- Add new props: `valuationType?: "sell" | "rent"`, `onValuationTypeChange?: (type: "sell" | "rent") => void`
- In the hero input mode section (line ~329-370), render the SkyToggle below the GoogleAddressInput (replacing the descriptive paragraph text at line 343-345)
- Toggle maps: unchecked (sun/day) = "sell", checked (moon/night) = "rent"

**4. Update `src/pages/Index.tsx`**
- Add `valuationType` state (`"sell" | "rent"`, default `"sell"`)
- Pass `valuationType` and `onValuationTypeChange` to both hero and bottom CTA `ValuationTicketCard` instances
- Update `handleGetValuation` to navigate to `/sell/valuation` or `/rent/valuation` based on `valuationType`
- Update `accentType` on cards to match `valuationType`
- Adapt content sections based on mode:
  - Hero heading: "really worth?" (sell) vs "rental income?" (rent)
  - Hero subtitle: market report (sell) vs rental estimate (rent)
  - Showcase flippable card: show sell values (sell) vs rent values (rent)
  - Stats, testimonials, report features: swap relevant entries based on mode
  - Bottom CTA heading adapts similarly
- Use `AnimatePresence` with a key on `valuationType` to animate content transitions when toggling

**5. Simplify routes in `src/App.tsx`**
- Keep existing routes as-is for now (sell/rent wizards and results still need separate flows due to different form steps)
- The toggle only affects which wizard the user is routed to from the homepage

### Result
The sky toggle sits inside the card below the address input. Sliding it switches the entire homepage between sell/rent messaging and routes the user to the correct valuation wizard. The page content animates between modes.

### Files
- `package.json` (add styled-components)
- `src/components/ui/sky-toggle.tsx` (new)
- `src/components/ValuationTicketCard.tsx`
- `src/pages/Index.tsx`

