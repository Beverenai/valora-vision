

## Plan: Fix Map Overflow on Mobile

### Problem
The Google Map in verify phase overflows horizontally on mobile because:
1. The card uses `overflow-visible` when in input mode with map expanded
2. The map container div has no `max-width` constraint relative to its parent

### Fix

**Modified: `src/components/ValuationTicketCard.tsx`**

1. Change `overflow-visible` to `overflow-hidden` when `mapExpanded` is true — the map doesn't need to overflow the card boundaries
2. Keep `overflow-visible` only for the search phase (dropdown suggestions need it)

Line 263: Change the overflow logic:
```
mapExpanded ? "overflow-hidden" : "overflow-visible"
```

Line 271: Same for the inner flex container — use `overflow-hidden` when map is expanded instead of `overflow-visible`.

**Modified: `src/components/shared/GoogleAddressInput.tsx`**

3. Add `max-w-full overflow-hidden` to the verify phase wrapper (line 392) to ensure the map respects parent width
4. Change the map container from `w-full` with fixed `height: "220px"` to also include `max-w-full` to prevent any overflow

### Files
| Action | File |
|--------|------|
| Modified | `src/components/ValuationTicketCard.tsx` — fix overflow logic for map phase |
| Modified | `src/components/shared/GoogleAddressInput.tsx` — add max-w-full constraints |

