

## Plan: Enhanced 3D Plastic Wrap with Bubble Wrap Effect

### What Changes

Transform the sealed wrapper into a more convincing 3D "card packet" with visible bubble wrap texture, enhanced depth/perspective, and a more dramatic opening animation.

### Visual Enhancements

**`src/components/shared/CardRevealWrapper.tsx`**:

1. **Bubble wrap texture** — Add animated circular "bubbles" scattered across the plastic wrap surface using CSS radial gradients. Multiple layers of small circles at varying sizes (6-14px) with subtle highlights to simulate air pockets. Some bubbles will have a brighter specular highlight.

2. **3D perspective on sealed state** — Add `perspective: 800px` and a subtle `rotateX(3deg)` tilt to the sealed wrapper to give it depth, making it look like a physical packet sitting on a surface. Add a ground shadow beneath.

3. **Enhanced plastic sheen** — Make the sheen more prominent with multiple moving highlight bands that slowly animate across the surface (a subtle looping CSS animation), simulating light hitting plastic.

4. **Thicker wrapper feel** — Add a second inner border/shadow layer to simulate the thickness of the plastic, plus a stronger `backdrop-blur(3px)` and slightly higher opacity tints.

5. **Better tearing animation** — When tearing, add "popping bubbles" particles (small circles that scale up and fade) alongside the existing sparkles. The wrapper halves should crumple/rotate more dramatically in 3D space (rotateZ + rotateX).

6. **Floating idle animation** — Subtle floating motion on the sealed packet (translateY oscillation) to make it feel alive and 3D.

### Implementation Details

- Add a `BubbleTexture` sub-component that renders a CSS-only bubble pattern using layered `radial-gradient`
- Add a `PopBubble` particle component for the tear animation (circles that expand and pop)
- Add a slow-moving sheen animation using framer-motion on the sealed wrapper
- Apply 3D perspective transform to the sealed container
- Add drop shadow beneath the wrapper for grounded 3D feel
- Increase sparkle count during tear from 12 to 20

### Files
- `src/components/shared/CardRevealWrapper.tsx`

