

## Plan: Fix Card Layout Issues

Three changes to both `SellValuation.tsx` and `RentValuation.tsx`:

### 1. Remove "Are you a real estate agent?" footer
Delete the footer block (lines 360-369 in Sell, lines 339-348 in Rent) that shows during the valuation process. This CTA only belongs on the landing page.

### 2. Fix address overflow in header
The address text in the header band can overflow the card. Add `overflow-hidden` to the header row and ensure the address container has proper truncation constraints. The `min-w-0 flex-1` is already there but the parent flex container needs `overflow-hidden`.

### 3. Move step indicator from header to bottom (replace barcode)
Remove the step dots from the header band. Replace the barcode section at the bottom with a step indicator showing labeled steps with icons/numbers. The navigation buttons stay above it.

New bottom layout:
```text
┌─────────────────────────────────┐
│  ← Back              Next →    │
│  ─────────────────────────      │
│  ① Location  ② Details  ③ ...  │  ← replaces barcode
│         VALORACASA              │
└─────────────────────────────────┘
```

The step indicator will show step names with completed checkmarks, active highlight, and upcoming steps dimmed — matching the card's warm aesthetic.

### Files changed
- `src/pages/SellValuation.tsx` — all 3 changes
- `src/pages/RentValuation.tsx` — all 3 changes

