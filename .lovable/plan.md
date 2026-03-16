

## Plan: Fix Hero Card Visibility + Show Card Twice on Page

### Problem
The `ValuationTicketCard` IS in the hero code (line 232) but doesn't render visibly. The card's inner faces use `absolute inset-0`, and the container relies on `aspect-ratio: 9/16` — but inside a flex column with `text-center` and no explicit width constraint on the wrapper, the card collapses to zero height on mobile.

### Changes

**1. `src/components/ValuationTicketCard.tsx` — Fix sizing**

- The outer wrapper `<div>` (line 310) wraps the card in `px-4 py-6`. The inner container (line 318) has `max-w-[280px] md:max-w-[340px]` with `aspect-ratio: 9/16`. This should work, but the card faces use `absolute inset-0` requiring the parent to have actual dimensions.
- Add explicit `min-h` to the card container as a fallback: calculate from aspect ratio (280 × 16/9 ≈ 497px → use `min-h-[480px] md:min-h-[520px]`)
- On desktop, allow a wider variant for hero use: add an optional `wide` prop that changes to a horizontal layout (image left, input right) at `md:` breakpoints

**2. `src/pages/Index.tsx` — Ensure card appears in hero + "What you get"**

- Hero (line 232): Keep the `ValuationTicketCard` in input mode — fix will come from the component sizing fix above
- "What you get" (line 301): Already exists with flippable showcase card — keep as-is
- Both instances remain on the page — card appears twice as requested

### Specific fixes

In `ValuationTicketCard.tsx`, line 318, change the card container styles:
```tsx
// From:
className="relative w-full max-w-[280px] md:max-w-[340px] group cursor-grab active:cursor-grabbing"
style={{ aspectRatio: "9/16", maxHeight: "520px", ... }}

// To:
className="relative w-full max-w-[280px] md:max-w-[340px] min-h-[480px] md:min-h-[520px] group cursor-grab active:cursor-grabbing"
style={{ aspectRatio: "9/16", ... }}
```

Remove `maxHeight: "520px"` which may be capping the card to zero when flex doesn't allocate width.

In `Index.tsx` hero section, ensure the card's parent gives it room by removing `gap-0` and using `gap-6`, and removing `text-center` from the card's parent (it conflicts with the card's internal layout).

