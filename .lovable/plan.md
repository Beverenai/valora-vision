

## Plan: Fix card overflow on mobile + widen on desktop

Two issues from the screenshot:

### 1. Mobile overflow — card too tall when map is open

The map-expanded state uses `min-h-[600px]` which pushes the card off-screen on smaller phones (~667px viewport). Fix by using viewport-relative height capped to fit:

- **Map expanded**: `min-h-[85vh]` mobile (fits any screen), keep `md:min-h-[70vh]` desktop
- **Search mode**: keep `min-h-[440px] md:min-h-[480px]` — these fit fine

Also shrink the hero image when map is expanded more aggressively on mobile to give the map more room.

### 2. Desktop — card too narrow

Currently `max-w-[340px] md:max-w-[520px]`. On a 1121px viewport that's very small. Widen:

- `max-w-[340px] md:max-w-[680px] lg:max-w-[780px]`

### Changes — `src/components/ValuationTicketCard.tsx`

**Line 202** (cardClasses): 
```
mapExpanded ? "min-h-[85vh] md:min-h-[70vh]" : "min-h-[440px] md:min-h-[480px]"
```

**Line 469** (outer wrapper max-width):
```
max-w-[340px] md:max-w-[680px] lg:max-w-[780px]
```

**Line 471** (outer wrapper min-height):
```
mapExpanded ? "min-h-[85vh] md:min-h-[70vh]" : "min-h-[440px] md:min-h-[480px]"
```

