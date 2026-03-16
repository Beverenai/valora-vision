

## Plan: Remove max-height cap when map is expanded

### Problem
From the screenshot, the map phase fits but the card isn't growing tall enough — the content is squeezed. The issue is on line 464: when `hasInput && mapExpanded`, the card has `min-h-[480px]` but no `max-h`, which is correct for the wrapper. However, the inner main section div (line 208) has `overflow-hidden`, which clips the map content inside the card.

### Changes

**`src/components/ValuationTicketCard.tsx`**:

1. **Line 208 — Remove overflow-hidden from main section when map is expanded**: Change the inner content div from `overflow-hidden` to `overflow-visible` when `mapExpanded` is true, so the map and confirm button aren't clipped inside the card's padded area.

2. **Line 211-212 — Make hero image even smaller on mobile when map is showing**: Change from `max-h-[80px]` to `max-h-[60px]` on mobile to free up more vertical space for the map + confirm button.

3. **Line 464 — Increase min-height when map is expanded**: Change `min-h-[480px]` to `min-h-[620px] md:min-h-[680px]` when `hasInput && mapExpanded` so the card actually grows taller to accommodate the map content.

### Result
When the map verification phase activates, the card smoothly grows taller, the hero image shrinks further, and the map + confirm button have ample room without clipping.

