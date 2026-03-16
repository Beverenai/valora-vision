

## Plan: Expand Card Height When Map Is Shown

### Problem
The card has a fixed `aspectRatio: "9/15"` and `max-h-[680px]` (mobile) / `max-h-[780px]` (desktop). When the Google address input transitions to the map verification phase (address bar + 220px map + confirm button ≈ 320px), the content overflows or gets clipped inside the card.

### Changes

**`src/components/ValuationTicketCard.tsx`**:

1. Add a new prop `mapExpanded?: boolean` to signal when the map is visible
2. In `Index.tsx`, track whether `GoogleAddressInput` is in "verify" phase and pass it down
3. When `mapExpanded` is true, remove the fixed `aspectRatio` and increase `max-h` constraints so the card grows to fit the map content naturally:
   - Mobile: `max-h-[680px]` → `max-h-[820px]`, no `aspectRatio`
   - Desktop: `max-h-[780px]` → `max-h-[900px]`, no `aspectRatio`
4. Also shrink the hero image `max-h` when map is expanded (e.g. `max-h-[25%]` instead of `max-h-[42%]`) to give more room to the map
5. Add a smooth `transition-all duration-500` so the card grows/shrinks gracefully

**`src/components/shared/GoogleAddressInput.tsx`**:
- Add an optional `onPhaseChange?: (phase: "search" | "verify") => void` callback
- Call it when `phase` state changes

**`src/pages/Index.tsx`**:
- Track `mapExpanded` state, set via `onPhaseChange`
- Pass `mapExpanded` to `ValuationTicketCard`

### Result
- Search phase: card keeps its normal ticket proportions
- Map phase: card smoothly expands taller, hero image shrinks, map + confirm button fit comfortably
- Confirm → navigates away, so no need to shrink back

