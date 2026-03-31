
Problem is not the overflow change alone. I checked the current code and found the real issue:

1. The bottom homepage card at `src/pages/Index.tsx` lines 743-756 does not pass `listingUrl` or `onListingUrlChange` into `ValuationTicketCard`.
2. Inside `ValuationTicketCard`, BUY mode only renders the BUY-specific URL input/toggle/button block when `onListingUrlChange` exists.
3. Because the bottom card is missing those props, it never enters the BUY layout. So when you switch to BUY, the bottom card falls back to the wrong branch, and the button appears/disappears incorrectly.

Plan

1. Fix the bottom BUY card wiring in `src/pages/Index.tsx`
- Pass the same BUY props used by the top hero card:
  - `listingUrl={listingUrl}`
  - `onListingUrlChange={setListingUrl}`
- Keep `valuationType`, `onValuationTypeChange`, and `mapExpandedBottom` as they are.
- This will make the bottom card render the correct BUY UI consistently.

2. Keep the clipping protection in `src/components/ValuationTicketCard.tsx`
- Preserve the current `mapExpanded || hasBuyInput ? "overflow-visible" : "overflow-hidden"` logic.
- No new structural change unless the BUY controls still visually clip after the prop fix.

3. Improve the “Are you a real estate agent?” section in `src/pages/Index.tsx`
- Refine the current CTA banner into a more polished card:
  - soft terracotta accent
  - serif headline
  - better spacing
  - optional subtle divider / top label
  - stronger button hierarchy
- Keep it centered and mobile-safe.

Expected result

- Bottom card will actually stay in the BUY flow instead of rendering the wrong state.
- BUY button/toggle will remain visible because the correct input block is used.
- The agent CTA section will look more premium and aligned with the rest of the homepage.

Files to update

- `src/pages/Index.tsx`
- `src/components/ValuationTicketCard.tsx` (only if a small follow-up visual adjustment is still needed after the real fix)
