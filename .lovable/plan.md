

## Plan: 3D Card Reveal Animation (Pokemon Pack Opening)

This is a large feature that creates a dramatic "unboxing" experience on the valuation result pages. When the user arrives at a result page, instead of immediately seeing their valuation, they see a sealed metallic wrapper that they tear open to reveal their ValuationTicketCard.

### Architecture

Create a single reusable component `CardRevealWrapper` that wraps the existing result pages. Both `SellResult.tsx` and `RentResult.tsx` will use it. The existing page content (report sections) remains untouched — it just becomes Phase 3 (scrollable content below the card).

### New Files

**1. `src/components/shared/CardRevealWrapper.tsx`** — The core component (~400 lines)

Contains all three phases:

- **Phase 1: Sealed Wrapper** — Full-viewport metallic wrapper with "VC" texture pattern, embossed "VALUED"/"ESTIMATED" text, dotted tear line, and a pulsing terracotta/green pull tab. Uses `framer-motion` `drag="x"` on the pull tab. As the user drags, the wrapper splits along the tear line with a light-leak glow effect.

- **Phase 2: Reveal Animation** — When drag exceeds 50% threshold: wrapper halves fly apart (top up, bottom down with rotateX), golden/green light burst from center using a radial gradient, 8-12 sparkle particles scatter with random trajectories (framer-motion `animate`), then the ValuationTicketCard springs in from below with `type: "spring"` physics and a diagonal shine sweep.

- **Phase 3: Card + Report** — Card is displayed with the existing 3D tilt effect (already built into `ValuationTicketCard`). A holographic shine overlay is added on top that shifts angle based on tilt. Below: "Scroll down for your full report ↓" indicator. On scroll, card scales down slightly and the full report sections fade in.

**Props:**
```tsx
interface CardRevealWrapperProps {
  children: React.ReactNode; // The full report content
  accentType: "sell" | "rent";
  // All ValuationTicketCard props for the revealed card
  cardProps: ValuationTicketCardProps;
  // Whether data is still loading
  loading?: boolean;
}
```

**Key implementation details:**

- Wrapper background: CSS `linear-gradient(135deg, #C0C0C0, #E8E8E8, #A0A0A0, #D4D4D4, #B0B0B0)` with repeating "VC" pattern via pseudo-elements at 10% opacity
- Tear line: `border-dashed` horizontal line at ~20% from top
- Pull tab: terracotta (#D4713B) for sell, green (hsl(var(--rent))) for rent, with CSS wiggle animation
- Drag: `framer-motion` `drag="x"` with `dragConstraints={{ left: -300, right: 0 }}`, tracks `dragProgress` as 0-1
- As drag progresses: tear gap opens (top half translates up proportionally), white glow intensifies in gap
- Reveal trigger at `dragProgress > 0.5`: `AnimatePresence` exits wrapper halves, enters card with spring
- Holographic overlay: CSS custom property `--shine-angle` updated from tilt values, `mix-blend-mode: overlay`
- Mobile: touch drag works natively with framer-motion; gyroscope tilt via `DeviceOrientationEvent` as enhancement
- Celebration sound reused from existing `ConfettiAnimation` (extract or duplicate the `playCelebrationSound` function)
- Confetti fires on reveal (reuse `ConfettiAnimation` component)
- `will-change: transform` on animated elements for 60fps

**Inline sub-components:**
- `SealedWrapper` — the metallic wrapper with texture, tear line, pull tab
- `Barcode` — decorative CSS barcode from ref code
- `HoloShine` — the holographic overlay div
- `SparkleParticle` — individual scatter particle with random trajectory

**2. Font addition in `index.html` or `index.css`**

Add `Italianno` is already loaded. Add `Playfair Display` for the "VALUED" embossed text on the wrapper:
```css
@import url('...&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
```

### Modified Files

**3. `src/pages/SellResult.tsx`**
- Wrap the existing content in `<CardRevealWrapper>`
- Pass card props and `accentType="sell"`
- Remove the standalone `<ValuationTicketCard>` and `<ConfettiAnimation>` (now handled inside the wrapper)
- The rest of the report sections become `children`

**4. `src/pages/RentResult.tsx`**
- Same pattern: wrap in `<CardRevealWrapper>` with `accentType="rent"`
- Remove standalone card and confetti

### Visual Flow

```text
┌─────────────────────────────┐
│   "Your valuation is ready" │  ← italic serif, muted
│                             │
│  ┌───────────────────────┐  │
│  │  ══ METALLIC WRAPPER ══│  │
│  │  ·······[VC]···········│  │  ← repeating VC pattern
│  │                        │  │
│  │     V A L O R A C A S A│  │  ← embossed silver
│  │                        │  │
│  │- - - - - - - - - -[TAB]│  │  ← dotted tear + pull tab
│  │                        │  │
│  │       VALUED           │  │  ← embossed semi-transparent
│  │                        │  │
│  │  PROPERTY VALUATION    │  │
│  │       REPORT           │  │
│  └───────────────────────┘  │
│                             │
│    ← Slide to open →       │
└─────────────────────────────┘

         ↓ drag tab ↓

┌─────────────────────────────┐
│    ✨ sparkles ✨            │
│                             │
│  ┌───────────────────────┐  │
│  │  [ValuationTicketCard] │  │  ← springs in with 3D tilt
│  │   with holo overlay    │  │
│  └───────────────────────┘  │
│                             │
│   Scroll down for report ↓  │
│                             │
│  ─────────────────────────  │
│  [ Full report sections ]   │
│  [ (existing content)    ]  │
└─────────────────────────────┘
```

### Scope

- One new component file (~400 lines)
- Two modified result pages (minor wrapping changes)
- One CSS font addition
- No database changes
- No new dependencies (framer-motion already installed)

