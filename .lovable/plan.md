

## Plan: Replace Recent Valuations with PropertyShowcaseCarousel

The existing `PropertyShowcaseCarousel` component already does exactly what's needed — it shows property images with prices and city chips, auto-rotates, and uses the project's design system. No need to install the external `@hugeicons` carousel; we already have the adapted version.

### Changes

**1. `src/pages/Index.tsx` — Replace Section 6 (Recent Valuations)**

- Remove the `RECENT_VALUATIONS` data array (no longer needed)
- Import `PropertyShowcaseCarousel` from `@/components/PropertyShowcaseCarousel`
- Replace the current Section 6 content (horizontal scroll cards) with the `PropertyShowcaseCarousel` component
- Keep the section header ("Recent valuations", live indicator, count) and place the carousel below it
- Remove horizontal padding on the carousel container so it stretches full-width within the max-w constraint

**2. `src/components/PropertyShowcaseCarousel.tsx` — Mobile-first refinements**

- On mobile (single column), stack vertically: city chips on top, image below
- Reduce chip list height on mobile to show ~4 items instead of all 8
- Reduce `ITEM_HEIGHT` on mobile via responsive classes
- Add `rounded-2xl overflow-hidden` to the outer container to match the landing page's rounded card style
- Ensure `min-h-[350px]` on mobile for the image panel (currently 400px, fine)

### No new dependencies needed
The `PropertyShowcaseCarousel` already uses `framer-motion`, `lucide-react`, and project utilities — all installed.

