

## Fix: Card size must stay consistent when flipped

### Problem
The front and back faces have different content heights. Since both are in a grid overlay, the taller face dictates the container size, causing a visible size jump on flip.

### Solution in `src/components/ValuationTicketCard.tsx`

1. **Give the grid container a fixed height instead of min/max-height ranges** (lines 516-519). For the showcase/result mode, set an explicit fixed height so flipping doesn't resize anything:
   - Mobile: `h-[520px]`  
   - Desktop: `md:h-[620px] lg:h-[680px]`
   - Remove `min-h-*` and `max-h-*` classes for the non-input result card

2. **Make both faces fill the container exactly** — ensure both `frontFace` and `backFace` divs use `h-full overflow-hidden` so their content is clipped to the fixed card size rather than stretching it.

3. **Back face content**: add `overflow-y-auto` inside the back face content area so if details exceed the fixed height, they scroll within the card rather than growing it.

### Files
- `src/components/ValuationTicketCard.tsx`

