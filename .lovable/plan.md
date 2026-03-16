

## Plan: Dual-mode Ticket Card — Hero Input + "What You Get" Showcase with Flip

### Concept

The `ValuationTicketCard` serves two distinct roles:

1. **Hero mode** (input): Shows the property image, brand elements, and barcode — but **no price, no city, no valuation data**. Instead, the middle area has the address input + "Get Valuation" CTA. This is the entry point.

2. **Result/showcase mode** (display): Used in a new "What you get" section below. Shows full valuation data (price, city, address). This card is **flippable** — tap/click to rotate 180° revealing a back face with property details: bedrooms, bathrooms, size, plot size, etc. displayed with small icons.

### Changes

**1. `src/components/ValuationTicketCard.tsx` — Refactor for dual modes**

- **Hero input mode** (`hasInput === true`):
  - Hide the price row (`estimatedValue` + `city`) entirely
  - Hide the subtitle cursive text and summary paragraph
  - Replace with: address input field + CTA button (already exists)
  - Keep: hero image, accent circles, barcode, brand stub — pure visual appeal
  - Adjust layout so the input area gets more vertical space

- **Result/showcase mode** (`hasInput === false`):
  - Add a `flipped` state + CSS 3D card flip (rotateY 180°) on click/tap
  - **Front face**: Current design — image, price, headline, barcode
  - **Back face**: Property detail grid with icons:
    - Bedrooms (Bed icon), Bathrooms (Bath icon), Built size (Ruler icon), Plot size (LandPlot icon), Property type, Condition
  - New props: `bedrooms?: number`, `bathrooms?: number`, `builtSize?: string`, `plotSize?: string`, `condition?: string`
  - Use `backface-visibility: hidden` on both faces + `transform-style: preserve-3d` on the container
  - Back face gets the same card background/rounded corners, with a clean grid layout

**2. `src/pages/Index.tsx` — Restructure sections**

- **Hero**: Pass the ticket card in input mode — remove `estimatedValue`, `city`, `secondaryValue` props (or set to empty). Keep `addressValue`, `onAddressChange`, `onSubmit`.
  
- **New "What you get" section** (between "How it works" and "Report Features"):
  - Heading: "See what you'll receive"
  - Show a `ValuationTicketCard` in result mode with example data (Villa, €1,250,000, Marbella, 4 bed, 3 bath, 350m²)
  - Small instruction text: "Tap the card to see more details"
  - The card flips on tap to show the property stats back face

### Card flip implementation (CSS only, no framer-motion)

```text
┌─────────────┐        ┌─────────────┐
│  FRONT      │  tap→  │  BACK       │
│  Image      │        │  🛏 4 beds  │
│  €1,250,000 │        │  🚿 3 baths │
│  VALUED     │        │  📐 350m²   │
│  Barcode    │        │  🏡 Villa   │
└─────────────┘        └─────────────┘
```

- Container: `transform-style: preserve-3d`, `transition: transform 0.6s`
- On `flipped`: `transform: rotateY(180deg)`
- Front div: `backface-visibility: hidden`
- Back div: `backface-visibility: hidden; transform: rotateY(180deg)` (pre-rotated)
- The existing 3D tilt interaction is disabled when flipped, re-enabled when flipped back

