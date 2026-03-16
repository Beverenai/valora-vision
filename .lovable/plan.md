

## Plan: Mobile optimization, performance fixes, and ticket card property image

### Problem analysis
1. **Lag**: The page has many `framer-motion` animations with `whileInView` on every card (6 report features + 3 how-it-works + carousel), all animating simultaneously. The `PropertyShowcaseCarousel` uses `AnimatePresence mode="popLayout"` which renders all 8 property cards in the DOM with continuous animation.
2. **Ticket card**: Shows a placeholder letter instead of a real property image. User wants a villa/house photo and a "3D touchable" feel (CSS 3D perspective tilt on touch/hover — no WebGL needed).
3. **Spacing/sizing**: Both components need breathing room on mobile and should be smaller overall.

### Changes

**1. `src/components/ValuationTicketCard.tsx` — Property image + 3D tilt + smaller size**

- Replace the placeholder letter in the hero area with an actual Unsplash villa image: `https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800`
- Add CSS 3D perspective tilt on hover/touch using `onMouseMove`/`onTouchMove` handlers that calculate rotateX/rotateY based on pointer position (pure CSS transform, no Three.js)
- Reduce `max-w-[480px]` → `max-w-[320px] md:max-w-[380px]` to make it smaller on both mobile and desktop
- Reduce `maxHeight` from 850px → 600px on mobile, 700px on desktop
- Add `mx-4` padding around the wrapper for mobile breathing room
- Image uses `grayscale` filter that removes on hover (already in code), just needs real `<img>` tag

**2. `src/components/PropertyShowcaseCarousel.tsx` — Performance + mobile spacing**

- Only render active, prev, and next cards in the image panel (skip hidden ones) to reduce DOM nodes and animation overhead
- Add `px-4 md:px-6` padding around the outer container for mobile spacing
- Reduce `min-h-[300px]` → `min-h-[250px]` on mobile for a tighter fit
- Use `will-change: transform` on animated chip items for smoother animations

**3. `src/pages/Index.tsx` — Performance optimization**

- Remove per-item staggered `whileInView` animations from `REPORT_FEATURES` and `HOW_STEPS` grids — use a single parent `whileInView` that fades the whole grid in, with CSS `animation-delay` for subtle stagger instead of 9+ framer-motion observers
- Reduce section vertical padding on mobile: `py-24 md:py-40` → `py-16 md:py-24` across sections for tighter mobile layout
- Add `px-4` to the carousel section for mobile breathing room

### No new dependencies
Pure CSS 3D transforms for the tilt effect. No `react-three-fiber` needed.

