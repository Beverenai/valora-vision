

## Plan: Fix BUY Toggle Visibility + Add Agent CTA

### Problem 1: Toggle Disappears in BUY Mode
The card's main content area (line 271 of `ValuationTicketCard.tsx`) uses `overflow-hidden` when the map is not expanded. In BUY mode, the URL input + platform badge + analyze button + toggle stack up and the toggle gets clipped by the fixed card height (`min-h-[440px]`).

**Fix in `src/components/ValuationTicketCard.tsx`:**
- Move the SkyToggle in the BUY input section (lines 394-403) to BEFORE the analyze button, so it appears higher in the card and doesn't get clipped
- Alternatively, increase the card's min-height when in buy mode, or change `overflow-hidden` to `overflow-visible` for the buy input section

Best approach: Move the toggle above the analyze button in buy mode (swap lines 384-392 with 394-403). This keeps the toggle visible without changing card dimensions.

### Problem 2: Add Agent CTA at Bottom
Add a subtle "Are you a real estate agent?" link after the final CTA section, before the Footer.

**Fix in `src/pages/Index.tsx` (after line 756):**
```tsx
<div className="text-center py-8">
  <Link to="/pro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
    Are you a real estate agent? <span className="underline font-medium">List your agency</span>
  </Link>
</div>
```

### Files Modified
- `src/components/ValuationTicketCard.tsx` — reorder toggle before analyze button in buy mode
- `src/pages/Index.tsx` — add agent CTA link before Footer

