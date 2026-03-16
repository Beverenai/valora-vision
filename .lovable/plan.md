

## Plan: Color-coded bubble label + spacing fix

### Changes

**1. `src/pages/Index.tsx` — Hero section**
- Replace the plain `SectionLabel` text ("Your Property Valuation") with a pill/bubble that changes color based on `valuationType`:
  - **Sell (Property Value)**: terracotta/orange background (`bg-[#FFF3EB] text-primary`) — matching the screenshot's rounded pill style
  - **Rent**: green tint (`bg-emerald-50 text-emerald-600`)
- Text inside the bubble: "Free property valuation" (sell) / "Free rental estimate" (rent)
- Wrap in `AnimatePresence` so it transitions with the heading
- Add more top padding to the hero (`pt-20 md:pt-24`) so the bubble isn't too close to the top of the viewport
- Remove the `<hr>` line divider below the label (the bubble is visually distinct enough)

**2. Styling**
- Pill classes: `px-5 py-2 rounded-full text-sm font-medium tracking-wide` — matching the screenshot's soft rounded bubble

### Files
- `src/pages/Index.tsx`

