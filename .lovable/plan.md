

## Plan: Fix the CardRevealWrapper sealed envelope rendering

### Root Cause

Two issues are causing the wrapper to be invisible:

1. **Container sizing**: The `SealedWrapper` container uses `style={{ aspectRatio: "2/3" }}` with `max-w-[340px]`, but all children are `position: absolute`. On some browsers/viewports, `aspect-ratio` on a container with only absolutely-positioned children can collapse to 0 height since absolute children don't contribute to intrinsic sizing.

2. **`useTransform` misuse**: Several `useTransform(() => ...)` calls are used inline inside JSX `style` props. In newer framer-motion versions, `useTransform` with a callback is meant to be called at the component top level, not inline. This can cause rendering issues or silent failures.

### Fix (single file edit)

**`src/components/shared/CardRevealWrapper.tsx`** — SealedWrapper sub-component:

- Replace `style={{ aspectRatio: "2/3" }}` with explicit dimensions: use `w-[340px] h-[510px]` (340 * 1.5) on mobile and `sm:w-[380px] sm:h-[570px]` on desktop. This guarantees the container has real computed dimensions.
- Move all `useTransform` calls to the top of the `SealedWrapper` component body instead of inline in JSX style props. Create named motion values:
  ```tsx
  const topHalfY = useTransform(() => -dragProgress * 20);
  const glowOpacity = useTransform(() => dragProgress * 2);
  ```
- Ensure the main wrapper body div (`absolute inset-0`) renders with the metallic gradient visible by keeping it at default z-index (below the z-20 top half and z-30 pull tab).

No other files need changes — the integration in `SellResult.tsx` and `RentResult.tsx` is correct.

### Files
- `src/components/shared/CardRevealWrapper.tsx`

