

## Plan: Fix Text Overlapping in ValuationTicketCard

### Problem
The front face has overlapping text because:
1. The "VALUATION REPORT / REF # / VALID FOR ONE" block is **absolutely positioned** (`absolute bottom-[55px] right-0`) and overlaps the `summaryText` paragraph above it
2. Fixed `h-[42%]` image height + fixed font sizes + fixed barcode height leaves insufficient space for variable-length text content
3. The 9:16 aspect ratio is too tall/narrow on mobile — text gets cramped

### Solution: Fluid layout that adapts to any content length

**`src/components/ValuationTicketCard.tsx` — Front face restructure**

1. **Remove absolute positioning** on the "VALUATION REPORT / REF #" block — make it flow naturally in the document, right-aligned above the barcode

2. **Replace fixed `h-[42%]` image** with a responsive approach:
   - Use `flex-shrink` so the image compresses when text needs more room
   - Set `min-h-[120px] max-h-[42%]` so it scales down gracefully

3. **Make text sizes responsive with `clamp()`** or smaller base sizes:
   - Price: `text-[1.6rem] md:text-[2.5rem]` (down from `2rem`)
   - "VALUED" headline: `text-[2.2rem] md:text-[3.5rem]` (down from `3rem`)
   - Cursive subtitle: `text-[1.8rem] md:text-[3rem]` (down from `2.5rem`)

4. **Summary text**: Add `line-clamp-4` so it truncates gracefully if too long, preventing overflow

5. **Remove the aspect-ratio: 9/16** from the outer container — let the card height be determined by content with a `min-h` and `max-h` instead. This is the core fix: the card should grow to fit its content rather than forcing content into a fixed ratio

6. **Back face**: Values already use `truncate` which is good. Increase grid item `min-w` slightly so "1,200 m²" fits without ellipsis — or use `text-xs` instead of `text-sm` for long values

### Layout after fix
```text
┌──────────────────────────┐
│  [Image: flex-shrink]    │  ← Shrinks if needed
│                          │
├──────────────────────────┤
│ €1,250,000      MARBELLA │  ← Smaller on mobile
│       VALUED             │
│ · · · · · · · · · · · ·  │
│ Your Valuation           │
│ YOUR PROPERTY HAS BEEN...│  ← line-clamp-4
│              REF #A1B2.. │  ← Flows naturally, not absolute
│ ║║║║║║║║║║║║║║║║║║║║║║║  │  ← Barcode at bottom via mt-auto
└──────────────────────────┘
```

