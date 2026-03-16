

## Plan: Make showcase card an exact clone of the hero card shell

### Root cause
The showcase card uses `size="showcase"` which has different max-widths, padding, font sizes, and barcode heights than the hero card (`size="hero"`). The fixed height constraints (`h-[520px] md:h-[620px] lg:h-[680px]`) don't match the hero's natural proportions, causing mismatched sizes between front/back and awkward empty space on the back face.

### Changes

**1. `src/pages/Index.tsx` — Switch showcase card to `size="hero"`**
- Line 283: Change `size="showcase"` to `size="hero"` so it uses the identical shell config (max-width, padding, typography, barcode) as the hero card.

**2. `src/components/ValuationTicketCard.tsx` — Fix flippable sizing**
- **Remove the separate fixed height for flippable cards** (line 512-513). Instead, use the same `min-h` / `max-h` constraints as non-flippable result cards so the card shell is identical regardless of flip state.
- **Make the back face fill its container properly**: the back face content area should use `flex-1` with `justify-between` so the detail grid stretches to fill the same shell height as the front face — no extra empty space, no size change.
- **Remove the `overflow-hidden` wrappers on the grid children** (lines 528-529) since the card faces themselves already have `overflow-hidden` via `cardClasses`. The grid children just need `gridArea: "1/1"` and identical dimensions.

**3. Delete `showcase` from `sizeConfig`**
- Remove the entire `showcase` entry from the sizeConfig object (lines 160-171) since it's no longer used. This eliminates the duplicate/divergent config entirely.

### Result
Both the hero input card and the showcase flippable card will render with the exact same outer shell — same max-width, same rounded corners, same shadow, same stub, same padding. The only difference is internal content (input vs result/details). Flipping will not change the card's dimensions.

### Files
- `src/pages/Index.tsx`
- `src/components/ValuationTicketCard.tsx`

