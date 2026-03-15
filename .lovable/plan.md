

## Plan: Valuation Success Ticket Card

Adapt the ECHO//SYSTEM ticket design into a **ValuationTicketCard** component that replaces the current `ValuationHero` at the top of both `SellResult.tsx` and `RentResult.tsx`. The card serves as the first-impression success message after a valuation completes.

### Design Adaptation

The ticket layout maps to valuation data as follows:

```text
┌─────────────────────────────────┬──────────┐
│  [Property Image Placeholder]   │          │
│    ● gold circle accents        │    ↓     │
│                                 │          │
│  €425,000    Marbella           │  V       │
│                                 │  A       │
│         VALUED                  │  L       │
│                                 │  O       │
│  ● ● ● ● ● ● ● ● ● ● ● ●     │  R       │
│                                 │  A       │
│  Your Valuation                 │          │
│  Summary text about the         │  C       │
│  property analysis...           │  A       │
│                                 │  S       │
│  ▌▌▌ ▌▌▌ ▌▌ ▌▌▌ (barcode)      │  A       │
│         REF-ID                  │    ↓  ⊕  │
└─────────────────────────────────┴──────────┘
```

**Color mapping**: `--accent-color` → gold (`hsl(var(--gold))`), `--bg-color` → `hsl(var(--muted))`, `--ink-color` → `hsl(var(--foreground))`. Blue circles become gold. The grayscale-to-color hover on the image is preserved.

**Fonts**: Keep Space Grotesk for numbers/data, Plus Jakarta Sans for headings (already in project), use a cursive Google Font import for the "Your Valuation" script header (Italianno, matching the original).

### Files to Change

1. **`src/components/result/ValuationTicketCard.tsx`** — New component
   - Props: `address`, `city`, `estimatedValue` (formatted price string), `propertyType`, `leadId`, `onShare`, `onDownload`
   - Full ticket layout with CSS (Tailwind + inline styles for the barcode/circles/animations)
   - Responsive: on mobile (<640px), hide the stub, reduce image height

2. **`src/pages/SellResult.tsx`** — Replace `<ValuationHero>` with `<ValuationTicketCard>`
   - Import the new component
   - Pass lead data as props
   - Keep confetti animation firing alongside the ticket

3. **`src/pages/RentResult.tsx`** — Upgrade from placeholder to full result page
   - Add the ticket card at top with rent-specific copy ("Your Rental Estimate" instead of "VALUED")
   - Use teal accent instead of gold for the circles

4. **`src/index.css`** — Add Italianno font import (one line addition to the existing Google Fonts import URL)

### Interactions Preserved
- Grayscale → color image on hover
- Floating animation on accent circle
- SVG dash animation in backdrop
- Dashed border tear-line between main and stub

### No new dependencies needed
All styling is CSS/Tailwind. Animations use CSS keyframes already supported.

