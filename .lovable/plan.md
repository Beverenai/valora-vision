

## Plan: Reduce card height before map, keep current map-expanded size

The card is currently `min-h-[75vh]` before the map opens — too tall. When the map is open (`mapExpanded`), the `85vh` size is good and stays.

### Changes — `src/components/ValuationTicketCard.tsx`

**Reduce pre-map min-height** in both places (cardClasses ~line 202 and outer wrapper ~line 466):

- **Before map**: `min-h-[75vh] md:min-h-[70vh]` → `min-h-[55vh] md:min-h-[50vh]`
- **Map expanded**: keep `min-h-[85vh] md:min-h-[80vh]` as-is

This shrinks the initial search card to roughly half the viewport (still much taller than the old pixel values) while preserving the full expansion when the map appears.

