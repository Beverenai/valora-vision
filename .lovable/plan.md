

## Plan: Make the card significantly wider on desktop/tablet

The card still appears small because:
1. At 1121px viewport, the `lg` breakpoint (1024px) applies `max-w-[960px]` but the `9/15` aspect ratio forces a narrow portrait shape, so the card height caps out and the width follows
2. The `md` breakpoint gives only `780px` which is modest

### Fix — `src/components/ValuationTicketCard.tsx`

**Aspect ratio (line 477)**: Remove or loosen the `9/15` aspect ratio for non-input mode on desktop. It forces a tall-narrow shape. Change to a wider ratio on `md+` or remove it entirely and let the card fill its max-width naturally.

**Outer wrapper widths (line 469)**: Push wider:
- `md:max-w-[780px]` → `md:max-w-[900px]`  
- `lg:max-w-[960px]` → `lg:max-w-[1100px]`
- Mobile stays `max-w-[360px]`

**Card face inner classes (line 199)**: Currently the card face uses the same constraints. Update to match.

**Remove aspect-ratio lock**: Line 477 sets `aspectRatio: "9/15"` for non-input, non-mapExpanded mode. This portrait ratio is the main reason the card stays narrow even with a large max-width. Remove it so the card can be wider and shorter — more natural for desktop.

### Summary of line changes

| Line | Current | New |
|------|---------|-----|
| 469 | `max-w-[360px] md:max-w-[780px] lg:max-w-[960px]` | `max-w-[360px] md:max-w-[900px] lg:max-w-[1100px]` |
| 477 | `aspectRatio: (hasInput \|\| mapExpanded) ? undefined : "9/15"` | `aspectRatio: undefined` (remove aspect ratio entirely) |

This lets the card stretch to fill ~80-90% of the viewport width on desktop while the height is determined by content rather than a fixed portrait ratio.

