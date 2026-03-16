
Root cause: the card wrapper was widened, but on `/` the card is still visually capped by its parent layouts and by the component’s own portrait-style internals. In particular:
- `src/pages/Index.tsx` still uses narrow section containers (`max-w-5xl`, and the showcase block uses `max-w-3xl`)
- `src/components/ValuationTicketCard.tsx` is still styled like a narrow ticket: conservative paddings, small type, small stub, and short image area

Plan

1. Make the component truly scalable
- Add a `size` prop to `ValuationTicketCard` such as `default | hero | showcase`
- Move the hardcoded width/height classes into responsive size maps inside the component
- For desktop/tablet variants, increase:
  - outer max width
  - result-mode min heights
  - internal padding
  - hero image height
  - desktop typography sizes
  - stub width on larger screens

2. Widen the homepage containers that are currently blocking it
- In `src/pages/Index.tsx`, increase the top page shell from `max-w-5xl` to a much wider layout (`max-w-[1400px]` or similar)
- In the “See what you’ll receive” section, remove the `max-w-3xl` cap from the wrapper holding the card
- Keep the text content constrained separately, but let the card row span much wider

3. Apply the larger variant where it matters
- Hero card on `/`: use `size="hero"`
- Flippable preview card: use `size="showcase"`
- Final CTA card: use `size="hero"`
- Leave the step-form shells in `SellValuation` / `RentValuation` alone, since those are intentionally smaller wizard cards

Technical details
- File 1: `src/components/ValuationTicketCard.tsx`
  - Replace the single hardcoded wrapper width with variant-based responsive widths
  - Scale the card internals at `md`/`lg` so the card itself looks bigger, not just its container
  - Keep mobile behavior as-is except for existing overflow-safe height rules

- File 2: `src/pages/Index.tsx`
  - Relax parent max-width constraints
  - Pass the new size prop to each landing-page card instance
  - Separate text-width constraints from card-width constraints in the showcase section

Expected result
- On desktop/tablet, the card will become materially larger and more proportional
- On mobile, it will stay safe and fit the viewport
- The homepage preview card will finally look bigger because both the component and its parent containers will allow it
