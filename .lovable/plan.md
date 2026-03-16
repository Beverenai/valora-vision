

## Plan: Make the card fill the full section height

### Problem
The card currently has `min-h-[560px]` on mobile which is far shorter than the available space between the hero text and the section divider below. There's a massive empty gap. The user wants the card to stretch all the way down to the divider, and grow even taller when the map appears.

### Changes

**`src/components/ValuationTicketCard.tsx`** — Line 464:

1. **Dramatically increase min-height in input mode**: Change from `min-h-[560px]` to `min-h-[75vh]` on mobile and `min-h-[70vh]` on desktop. This makes the card fill most of the viewport, stretching down to the divider.

2. **Even taller when map is expanded**: Change from `min-h-[620px]` to `min-h-[85vh] md:min-h-[80vh]` so the card grows further and pushes the page content down.

This uses viewport-relative units so the card always fills the available space regardless of device height.

