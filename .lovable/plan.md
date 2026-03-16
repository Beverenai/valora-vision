

## Plan: Fix Card Overflow and Blank Screen on Map Phase

### Problems
1. **Input/suggestions go off-screen**: The card uses `absolute inset-0` for the front face with `overflow-hidden`, clipping the GoogleAddressInput dropdown and map content that exceeds the card's constrained height.
2. **Blank screen on "Use current location"**: When switching to verify phase, the map (220px) + address bar + confirm button (~320px total) plus the hero image don't fit within the card's `max-h-[680px]` on mobile (390px viewport). The content is clipped away entirely.

### Root Cause
- The front face is `absolute inset-0` with `overflow-hidden` — content that exceeds the card dimensions is invisible.
- On mobile, `max-h-[820px]` with `aspectRatio: undefined` still can't contain hero image + map + button when the hero image takes too much space.
- The autocomplete suggestions dropdown (positioned `absolute z-50`) gets clipped by the card's `overflow-hidden`.

### Changes

**`src/components/ValuationTicketCard.tsx`**:

1. **Allow overflow for suggestions**: When in input mode, change the front face container from `overflow-hidden` to `overflow-visible` so the autocomplete dropdown can render outside the card boundaries.

2. **Shrink hero image more aggressively on mobile in map phase**: Change `mapExpanded` hero image max-height from `max-h-[25%]` to `max-h-[80px] md:max-h-[25%]` so there's room for the map.

3. **Remove max-h constraint when map is expanded**: Instead of `max-h-[820px]`, use `max-h-none` when `mapExpanded` is true so the card grows to fit its content naturally. Keep `min-h` for visual stability.

4. **Make the card container use relative positioning instead of absolute when in input/map mode**: Change the front face from `absolute inset-0` to `relative` when `hasInput` is true, so card height is driven by content. This means the wrapper div should not use aspect-ratio in input mode at all — let content dictate height.

### Simpler Approach
Actually, the cleanest fix is:
- When `mapExpanded` is true, remove both `max-h` and `aspectRatio` constraints, and set the front face to `overflow-visible`
- Shrink the hero image to `max-h-[80px]` on mobile when map is expanded
- Set `overflow-visible` on the card wrapper when `hasGoogleInput` is true (so dropdown suggestions aren't clipped)

**Files to edit**:
- `src/components/ValuationTicketCard.tsx` — adjust card constraints and overflow behavior

