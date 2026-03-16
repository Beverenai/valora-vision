

## Plan: Bento Grid for "Everything In Your Report"

### What
Replace the current flat 2-column list of report features with an asymmetric bento grid where each feature has a mini visual preview mockup inside its card.

### Layout (Mobile-first, 390px viewport)

```text
Mobile (single column, full-width cards):
┌──────────────────────────────┐
│  Estimated Market Value      │  ← tall hero card
│  ┌────────────────────────┐  │
│  │  €845,000              │  │
│  │  Range: €790K – €900K  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
┌─────────────┐ ┌──────────────┐
│ Price/m²    │ │ Property     │  ← 2-col row
│ €3,200/m²   │ │ Analysis     │
└─────────────┘ └──────────────┘
┌──────────────────────────────┐
│  Market Trends               │  ← wide card
│  ↗ chart mockup              │
└──────────────────────────────┘
┌─────────────┐ ┌──────────────┐
│ Comparables │ │ Agent Recs   │  ← 2-col row
│ 3 mini cards│ │ matched icon │
└─────────────┘ └──────────────┘

Desktop (2-col bento with spanning):
┌──────────────────┬───────────┐
│ Market Value     │ Price/m²  │
│ (spans tall)     │───────────│
│                  │ Analysis  │
├──────────────────┴───────────┤
│ Market Trends (full width)   │
├───────────┬──────────────────┤
│ Comps     │ Agent Recs       │
└───────────┴──────────────────┘
```

### Implementation — `src/pages/Index.tsx`

**1. Update data arrays** — add a `visual` type field and `gridClass` to each feature for bento sizing:
- `"hero"` — large card with mock price display
- `"metric"` — small card with single stat
- `"chart"` — wide card with mini trend line SVG
- `"cards"` — card with mini property thumbnails
- `"icon"` — card with centered icon treatment

**2. Replace the grid section (lines 457–493)** with a CSS Grid bento layout:
- `grid-cols-2` on mobile, `grid-cols-4` on desktop
- Hero card spans 2 cols (+ 2 rows on desktop)
- Market trends spans full width
- Cards use `bg-card` with subtle `border border-border` and `rounded-2xl`
- Each card renders a tiny decorative visual:
  - Market Value: large price number + confidence bar
  - Price/m²: single bold metric
  - Property Analysis: strength indicator dots
  - Market Trends: inline SVG sparkline (static, decorative)
  - Comparables: 3 tiny placeholder cards in a row
  - Agent Recs: avatar circles + checkmark

**3. Styling** — follows La Sala language:
- White cards on off-white bg
- Terracotta accent tints on `accent: true` cards (rent: green tints)
- `whileInView` staggered fade-in per card (0.08s delay each)
- Generous padding inside cards (`p-5 md:p-6`)

**4. Rent mode** — same layout, different visual content in hero card (monthly estimate instead of market value), green accents instead of terracotta.

### Files Modified
- `src/pages/Index.tsx` — report features section only

