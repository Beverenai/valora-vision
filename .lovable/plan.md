

## Plan: Fix flippable card — true 3D flip animation with identical sizing

### Problem
1. **No 3D flip**: Clicking the card just cross-fades opacity between front/back. There's no actual Y-axis rotation animation.
2. **Size mismatch**: Front and back are separate divs stacked in a grid with `min-h`/`max-h` ranges, so each face can resolve to a different height.

### Root cause
- `handleCardClick` toggles `flipped` state, but the container only uses opacity transitions (`opacity: flipped ? 0 : 1`) — no `rotateY(180deg)` transform.
- Both faces are separate full card renders (`cardClasses` applied independently), each computing their own height.

### Solution in `src/components/ValuationTicketCard.tsx`

**1. True 3D Y-axis flip on click**
- On the outer wrapper (the grid container at line 490), add `rotateY(180deg)` when `flipped` is true, combined with the existing tilt transform.
- Remove the opacity-based show/hide from the individual faces entirely.
- Instead, use `backface-visibility: hidden` on both face wrappers so the CSS 3D engine handles which face is visible.
- The back face wrapper gets an additional `rotateY(180deg)` so it starts flipped and becomes visible when the container rotates.

**2. Fixed identical dimensions**
- Replace the `min-h`/`max-h` range approach with a single explicit height for the flippable showcase card: `h-[480px] md:h-[560px] lg:h-[620px]`.
- Both face divs use `h-full` so they fill the exact same container — no independent sizing.

**3. Remove shadow from individual faces, put on container**
- Move the `shadow-[...]` from `cardClasses` to the outer grid container for flippable cards, so the shadow stays consistent during rotation and doesn't double up.

### Key changes

```tsx
// Outer container — add flip rotation + shadow
style={{
  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (flipped ? 180 : 0)}deg)`,
  transformStyle: "preserve-3d",
}}
className="... h-[480px] md:h-[560px] lg:h-[620px] shadow-[0_8px_30px_...]"

// Front face wrapper
<div style={{ gridArea: "1/1", backfaceVisibility: "hidden" }}>
  <div className={cn(cardClasses, "h-full")}>{/* front content */}</div>
</div>

// Back face wrapper  
<div style={{ gridArea: "1/1", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
  <div className={cn(cardClasses, "h-full")}>{/* back content */}</div>
</div>
```

- Remove `opacity`/`pointerEvents` style logic from front and back face divs.
- For flippable cards, strip shadow from `cardClasses` (move to container).

### Files
- `src/components/ValuationTicketCard.tsx`

