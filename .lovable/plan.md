

## Plan: Fix showcase card spacing and reorder back-face details

### Changes in `src/components/ValuationTicketCard.tsx`

**1. Add more space between barcode and detail boxes on the front face**
- On the result/display mode barcode (line 417), add `mt-4 md:mt-6` instead of `mt-auto` to increase the gap between the summary text block and the barcode
- Also add `mb-4` to the ref code text above the barcode (line 412) to create more breathing room

**2. Reorder back-face detail items so Type and Condition appear first**
- Currently `detailItems` (lines 216-223) lists: Bedrooms, Bathrooms, Built Size, Plot Size, Type, Condition
- Reorder to: Type, Condition, Bedrooms, Bathrooms, Built Size, Plot Size

### Files to edit
- `src/components/ValuationTicketCard.tsx`

