

## Plan: Full-Height Card Without Internal Scrolling

### Problem
The form card has `overflow-y-auto` on the content area (line 268), causing scrolling *inside* the card. The card also has a fixed `max-w` which constrains height. The map in the location step is 220px tall, and combined with the address bar and confirm button, it overflows the card.

### Solution
Remove internal scroll from the card and let the card grow to fit its content. The page itself can scroll naturally if needed (browser-level scroll), but the card component never scrolls internally.

### Changes

**`src/pages/SellValuation.tsx`** (line 268):
- Change `overflow-y-auto` to `overflow-visible` (or just remove it) on the form content div
- This single change makes the card grow with content instead of constraining + scrolling

**`src/pages/RentValuation.tsx`** (same pattern):
- Apply the identical change for consistency

**`src/components/shared/GoogleAddressInput.tsx`** (line 410):
- The map height is currently `220px` — no change needed, it fits naturally when the card can grow

### What this achieves
- Card stretches vertically to fit all content (search input, suggestions, map, confirm button)
- No internal scrollbar ever appears
- On small screens, the *page* scrolls naturally if the card is taller than viewport
- All other steps (Details, Features, Contact) also benefit — they just render at natural height

