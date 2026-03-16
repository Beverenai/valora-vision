
Yes — I understand. The screenshot shows the hero card still behaving like a narrow portrait ticket, not a wide desktop feature card.

What I found in the code:
- `src/components/ValuationTicketCard.tsx` does not really have separate desktop sizes yet:
  - `size="hero"` and `size="showcase"` both collapse into the same `isLarge` branch
  - that branch is still only `md:max-w-[680px] lg:max-w-[800px]`
- some “large” values are actually smaller than the default variant on desktop/tablet, so the card does not feel bigger
- the input version is still built as a tall stacked layout, with narrow internal content like the helper text capped at `max-w-[280px]`
- so even when the wrapper got a little wider, the component itself still looks basically the same

Plan
1. Rework the component sizing system in `src/components/ValuationTicketCard.tsx`
- replace the single `isLarge` boolean with real per-size configs: `default`, `hero`, `showcase`
- give `hero` a true desktop width (`md`/`lg` noticeably larger than now)
- make `showcase` separate from `hero` instead of sharing the same values

2. Change the hero/input card layout itself on desktop
- keep mobile as-is
- on tablet/desktop, switch the input card from “narrow stacked ticket” to a wider landscape composition
- enlarge the main content area, image block, input area, padding, and stub proportionally
- remove narrow internal caps like the `max-w-[280px]` helper text so the content can actually breathe across the wider card

3. Relax the height logic that keeps it feeling portrait
- reduce the tall portrait-style min/max height behavior for desktop hero mode
- let the desktop card become wider and relatively shorter, so it reads as wide immediately

4. Keep the landing page usage aligned
- keep `src/pages/Index.tsx` using `size="hero"` for the top and bottom cards
- keep the flippable preview as `size="showcase"`, but give it its own proportions so it can still feel premium without matching the hero exactly

Expected result
- on the current 1121px viewport, the hero card will look clearly wider, not just “slightly scaled”
- the change will come from the component’s internal layout, not only from outer max-width tweaks
- mobile behavior will stay safe and unchanged
