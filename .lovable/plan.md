

## Plan: Fit card on screen + add descriptive text before map

Looking at the screenshots: the second image (search phase) shows the card fits nicely with barcode visible. The first image (map phase) shows the card is too tall — the bottom is cut off. Two issues to fix:

### 1. Reduce initial card height to fit on screen

The current `min-h-[55vh]` is causing the card to be taller than needed in search mode. Since the user is on a 390×796 viewport and the card needs to fit below the hero text:

- **Search mode**: reduce to `min-h-[440px] md:min-h-[480px]` (fixed pixels that fit on screen)
- **Map mode**: use `min-h-[600px] md:min-h-[70vh]` — tall enough for the map but not overflowing the viewport

Apply to both `cardClasses` (line 202) and outer wrapper (line 466).

### 2. Add descriptive text in the empty space before map appears

In the input mode section (line 293), below the `GoogleAddressInput` / search bar and above the barcode, add a short editorial blurb that only shows when the map is NOT expanded. Something like:

> "Enter your property address above and we'll provide an instant, AI-powered market valuation based on comparable sales, location data, and current demand."

This fills the empty beige space between the search input and barcode with useful context. When the map appears, this text hides to make room.

### Files changed

**`src/components/ValuationTicketCard.tsx`**:
- Line 202: Update `cardClasses` min-heights
- Line 293-329: Add descriptive paragraph in input mode, visible only when `!mapExpanded`
- Line 466: Update outer wrapper min-heights to match

