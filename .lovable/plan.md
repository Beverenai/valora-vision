

## Plan: Fix Build Error + Fullscreen Landing Page Redesign

### Part 1 — Fix ENOENT Build Error

The `src/components/result/ValuationTicketCard.tsx` file exists but Vite can't resolve it. This is the same recurring directory resolution issue. Fix by changing the import in both result pages to use the barrel export:

- `src/pages/SellResult.tsx` line 6: change `from "@/components/result/ValuationTicketCard"` → `from "@/components/result"`
- `src/pages/RentResult.tsx` line 6: change `from "@/components/result/ValuationTicketCard"` → `from "@/components/result"`

Use destructured import: `import { ValuationTicketCard } from "@/components/result"`.

### Part 2 — Fullscreen Immersive Index Page

Complete rewrite of `src/pages/Index.tsx`. No Navbar, no Footer.

**Structure** (single 100vh screen, no scroll):

```text
┌──────────────────────────────────────┐
│         ValoraCasa (small logo)       │  ← top center, white
│                                      │
│   What is your property in Spain     │
│        really worth?                 │  ← "really" in gold
│                                      │
│   Free AI-powered valuations...      │  ← subtitle, white/60
│                                      │
│   ┌──────────────────────────────┐   │
│   │  Enter your property address │   │  ← GoogleMapsAddressInput
│   └──────────────────────────────┘   │
│                                      │
│   [ I want to sell ] [ I want to rent]│  ← pill toggles
│                                      │
│   12,400+ Valuations • 45+ Cities    │  ← trust strip
│                                      │
│   ★★★★★ "Quote..." — Name           │  ← rotating testimonial
└──────────────────────────────────────┘
```

Background: Unsplash luxury Costa del Sol image with dark overlay (`bg-cover`, `bg-center`, overlay via `bg-black/60`).

**Address flow**: When user selects an address and clicks a type pill (or has one selected), navigate to `/sell/valuation` or `/rent/valuation` with address state.

**Components used**:
- `GoogleMapsAddressInput` — existing, embedded in hero
- `framer-motion` — fade-in animations on load
- Testimonials — inline rotating quotes (3-4 hardcoded), auto-cycle every 5s

**Pulsing glow on input**: CSS animation via `box-shadow` with `animate-pulse` variant or custom keyframe in Tailwind config.

### Files Changed

1. **`src/pages/Index.tsx`** — Complete rewrite (fullscreen, no navbar/footer)
2. **`src/pages/SellResult.tsx`** — Fix import (line 6)
3. **`src/pages/RentResult.tsx`** — Fix import (line 6)
4. **`tailwind.config.ts`** — Add `glow-pulse` keyframe for the address input effect

