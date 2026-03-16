

## Plan: Widen the ValuationTicketCard for desktop and tablet

The card's current max-widths are conservative. At 1121px viewport, `max-w-[780px]` leaves a lot of unused space. Update to fill more of the screen proportionally.

### Changes — `src/components/ValuationTicketCard.tsx`

**Outer wrapper (line 469)** — increase max-widths:
- Mobile: `max-w-[360px]` (from 340px — slightly more breathing room)
- Tablet (md): `max-w-[780px]` (from 680px)
- Desktop (lg): `max-w-[960px]` (from 780px)

**Compact mode (line 183)** — scale up proportionally:
- Mobile: keep `max-w-[320px]`
- Tablet (md): `max-w-[680px]` (from 520px)

This gives the card roughly 85% of the viewport width on a 1121px screen, making it feel full and editorial rather than floating in empty space.

