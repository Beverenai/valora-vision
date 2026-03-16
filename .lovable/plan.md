

## Plan: Fix showcase card — 3D tilt, consistent sizing, shadow, remove back-face barcode

### Problems identified
1. **No 3D tilt on showcase card** — The result/showcase mode (lines 505-529) uses a flat grid layout with no `perspective`, no mouse/touch handlers, and no `preserve-3d`. Only the input-mode card (lines 532-555) gets the 3D tilt interaction.
2. **Card size changes on flip** — Fixed heights are applied but both faces need `h-full` enforcement on their inner content.
3. **Shadow quality** — The current shadow is basic. Needs a layered, elevated shadow.
4. **Barcode on back face** — Lines 485-490 render a barcode on the back face that should be removed (it's already on the front).

### Changes in `src/components/ValuationTicketCard.tsx`

**1. Enable 3D tilt for showcase/result cards (lines 505-529)**
- Wrap the showcase card in the same `perspective: 800px` container
- Attach `onMouseMove`, `onMouseLeave`, `onTouchMove`, `onTouchEnd` handlers
- Apply the same `rotateX/rotateY` transform with `preserve-3d`
- Add `cursor-grab` / `cursor-pointer` classes
- Keep the grid overlay for front/back face stacking

**2. Upgrade shadow**
- Replace `shadow-[0_20px_50px_rgba(0,0,0,0.15)]` in `cardClasses` (line 245) with a richer layered shadow: `shadow-[0_8px_30px_rgba(0,0,0,0.12),0_30px_60px_rgba(0,0,0,0.15)]`

**3. Remove barcode from back face (lines 484-490)**
- Delete the barcode div and ref code text from the back face entirely
- Let the detail grid use `flex-1` to fill the freed space naturally

**4. Ensure both faces fill fixed height**
- Both face wrappers already have `h-full overflow-hidden` — verify the inner flex containers use `h-full` so content stretches properly within the fixed card

### File
- `src/components/ValuationTicketCard.tsx`

