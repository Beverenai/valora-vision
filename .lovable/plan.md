

## Plan: Ticket Card as Hero with Integrated Address Input + Performance Fix

### Concept
The `ValuationTicketCard` becomes the hero section's centerpiece. The "VALUED" headline area gets replaced with the address input field and CTA button, making the card both a visual showcase AND the primary conversion element. The rest of the hero text (title, subtitle) wraps around it.

### Changes

**1. `src/pages/Index.tsx` — Restructure Hero**

- Remove the separate `AddressBlock` from hero — it moves inside the ticket card
- Remove Section 2 ("See what you'll get") entirely — the card IS the hero now
- Hero layout: badge + title + subtitle above, then the ticket card with embedded input below
- Pass `address`, `setAddress`, `onGetValuation` as new props to `ValuationTicketCard`
- Remove 4 of the 5 hero `motion.*` wrappers — use a single fade-in on the whole hero container instead of 5 separate animated elements (fixes lag)
- Replace `motion.section` with plain `section` on sections 3-5 (trusted by, how it works, report features) — use CSS `animate-fade-in` class instead of framer-motion `whileInView` observers
- Keep framer-motion only for: testimonial carousel (needs AnimatePresence), PropertyShowcaseCarousel (already optimized), and sticky CTA

**2. `src/components/ValuationTicketCard.tsx` — Embed Address Input**

- Add optional props: `addressValue?: string`, `onAddressChange?: (v: string) => void`, `onSubmit?: () => void`
- When these props are provided, replace the "VALUED" headline (`h2`) with:
  - A compact address input field (pin icon + text input)
  - A "Get Valuation" button below it
- Keep the rest of the card identical: hero image, price, barcode, etc.
- The card still has 3D tilt on touch/hover
- Remove the `will-change: transform` from the card style (causes compositing overhead on mobile) — use it only during active interaction via a state flag

**3. `src/components/PropertyShowcaseCarousel.tsx` — Reduce animation cost**

- Replace `AnimatePresence mode="popLayout"` with `mode="wait"` — popLayout forces layout recalculation on every transition
- Remove `motion.div` from non-active cards entirely — just render the active card with a simple opacity fade
- Remove the gradient overlay animation on chip list (static CSS is fine)

### Performance Summary
- **Before**: ~15 framer-motion observers + 5 hero animations + carousel with 8 animated cards = ~28 simultaneous animation nodes
- **After**: 1 hero fade + 1 testimonial AnimatePresence + 1 carousel active card + 1 sticky CTA = ~4 animation nodes

