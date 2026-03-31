

## Plan: Remove All Barcodes from ValuationTicketCard

Remove the three barcode sections from `ValuationTicketCard.tsx` and clean up the unused `barcodeHeight` config property.

### Changes in `src/components/ValuationTicketCard.tsx`

1. **Remove `barcodeHeight` from size configs** (lines 172, 183) and from the destructure (line 187)

2. **Remove barcode block in compact/result mode** (lines 344-350) — the 6-line barcode + ref code below the result

3. **Remove barcode block in non-hero result mode** (lines 490-496) — same pattern in the default-size result view

4. **Remove barcode block for input mode** (lines 501-508) — the "VALORACASA" barcode at the bottom of input state

### Files Modified
- `src/components/ValuationTicketCard.tsx`

