

## Plan: Make the input-mode card taller with more space before the barcode

### Problem
In the default input mode (no map), the card is too short. The input field sits right above the barcode with almost no breathing room. The card needs to be taller overall and have more vertical space between the form area and the barcode.

### Changes

**`src/components/ValuationTicketCard.tsx`**:

1. **Line 291 — Add bottom padding/spacing to the input content area**: Change `justify-center` to `justify-center` and add `pb-8 md:pb-12` so the form content pushes away from the barcode below.

2. **Line 464 — Increase default min-height for input mode**: Change `min-h-[480px]` to `min-h-[560px]` on mobile and `min-h-[540px]` to `min-h-[620px]` on desktop, so the card is taller even before the map appears.

3. **Line 464 — Remove max-h constraint in input mode**: Remove `max-h-[680px]` and `md:max-h-[780px]` for the `hasInput` case (non-map-expanded), letting the card use its natural height driven by min-h + content.

### Result
The card in input mode will be noticeably taller, with generous spacing between the address input and the barcode at the bottom.

