

## Plan: Enable 3D tilt on back face + enhance flip feel

### Problem
1. **No tilt on back face** — Line 174 in `handlePointerMove` returns early when `flipped` is true, so the back face has zero 3D interaction.
2. **Flip transition feels flat** — The `perspective` is 1200px (quite far), and the transition timing could be snappier with a slight spring feel.

### Changes in `src/components/ValuationTicketCard.tsx`

**1. Remove `flipped` guard from tilt handler (line 174)**
- Change `if (flipped || isCompact || isProcessing) return;` to `if (isCompact || isProcessing) return;`
- This allows mouse/touch tilt to work on both faces equally.

**2. Tighten perspective for more dramatic 3D (line 488)**
- Change `perspective: "1200px"` to `perspective: "800px"` on the showcase container — matches the input card and gives a more pronounced 3D depth during both tilt and flip.

**3. Improve flip transition timing (line 510)**
- Change the non-interacting transition from `"transform 0.7s ease-in-out"` to `"transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)"` for a snappier, more physical flip feel.

### File
- `src/components/ValuationTicketCard.tsx`

