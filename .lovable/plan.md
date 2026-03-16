

## Plan: Redesign Recent Valuations section using ValuationTicketCard components

### Problem
The "Recent Valuations" section currently uses a custom carousel with background images. The user wants to reuse the actual `ValuationTicketCard` component to show these as mini valuation cards, and switch labels/values between sell (price) and rent (monthly income) modes.

### Changes

**1. `src/components/PropertyShowcaseCarousel.tsx` — Full redesign**

Replace the current two-panel carousel layout with a horizontal scrollable row of `ValuationTicketCard` components in result mode (non-interactive, display-only).

- Update `PROPERTIES` data to include both `price` and `rentPrice` fields (e.g. `€1,250,000` vs `€4,200/mo`)
- Render 3-4 visible cards in a horizontally scrolling container with snap scrolling
- Each card uses `ValuationTicketCard` with:
  - `mode` = undefined (result/display mode)
  - `headline` = "VALUED" (sell) or "ESTIMATED" (rent)
  - `estimatedValue` = price (sell) or rentPrice (rent)
  - `accentType` = passed from parent
  - `propertyType`, `city`, `address` from PROPERTIES data
  - `size` = "default" (smaller cards)
  - `flippable` = false
  - No share/download handlers (showcase only)
- Auto-scroll animation that cycles through cards
- On mobile: single card visible with swipe, on desktop: 3 cards visible
- Keep the `accentType` prop for color theming

**2. `src/pages/Index.tsx` — Update section header text**

- Change "Recent Valuations" to dynamically switch: "Recent Valuations" (sell) / "Recent Rental Estimates" (rent)
- Update the subtitle count text similarly

### Files
- `src/components/PropertyShowcaseCarousel.tsx`
- `src/pages/Index.tsx`

