

## Problem

The showcase card in the "See What You'll Receive" section is invisible. The heading, subtitle, and "Tap the card" hint all render, but the card itself is a blank space.

**Root cause**: In `ValuationTicketCard.tsx`, when the card is in result mode (no input), the card face uses `absolute inset-0` positioning. This works for the flip animation. However, the card's background color `bg-[hsl(36_9%_88%)]` blends with the section's `bg-secondary/50`, AND more critically — the 3D transform context (`preserve-3d` + `backface-visibility: hidden`) without an explicit `translateZ` on the front face can cause rendering issues where the card becomes invisible in certain browsers/contexts.

The hero input cards work fine because they use `relative` positioning (line 246-247), not `absolute inset-0`.

## Fix

**File: `src/components/ValuationTicketCard.tsx`**

1. Add `translateZ(1px)` to the front face when in result/flippable mode, ensuring it renders above z=0 in the 3D context
2. Add a visible shadow and slight border to the card so it's distinguishable from the section background even when colors are similar
3. Ensure the front face has proper stacking in the 3D rendering context

Specifically:
- On the `frontFace` div (around line 252), add an inline style `transform: "translateZ(1px)"` when not in input mode — this ensures the face renders in front within the `preserve-3d` context
- On the `backFace` div (line 456), keep the existing `rotateY(180deg)` but also add `translateZ(1px)`
- This is a known CSS 3D rendering fix for `backface-visibility: hidden` elements that appear invisible

