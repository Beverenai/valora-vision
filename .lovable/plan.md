

## Plan: Dynamic theme colors for PropertyShowcaseCarousel

### Problem
The Recent Valuations carousel always uses orange/gold accent colors regardless of the sell/rent toggle state.

### Changes

**1. `src/components/PropertyShowcaseCarousel.tsx`**
- Add a new prop: `accentType?: "sell" | "rent"` (default `"sell"`)
- Replace all hardcoded `text-gold` and `bg-gold` references with conditional classes:
  - `text-gold` → `isSell ? "text-gold" : "text-emerald-400"`
  - `bg-gold/90` / `bg-gold` → `isSell ? "bg-gold/90" : "bg-emerald-500/90"` (and hover variant)
  - `text-primary` on the CTA button text → `isSell ? "text-primary" : "text-white"`
- Also swap the left panel `bg-primary` to green when in rent mode: `isSell ? "bg-primary" : "bg-[hsl(var(--rent-foreground))]"`
- Update label text: "Estimated Value" (sell) vs "Estimated Rent" (rent), "Get Valuation" vs "Get Estimate"

**2. `src/pages/Index.tsx`**
- Pass `accentType={valuationType}` to `<PropertyShowcaseCarousel />`

### Files
- `src/components/PropertyShowcaseCarousel.tsx`
- `src/pages/Index.tsx`

