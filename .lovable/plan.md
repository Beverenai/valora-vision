

## Plan: Explore Areas Section, Admin Badge, Comparable Card Redesign

### 1. Add "Explore Areas" section to Index.tsx

**Modified: `src/pages/Index.tsx`**

Add a new section before the Final CTA (around line 719) with circular image thumbnails in a horizontal scroll container. Uses the 8 specified zones with placeholder images from Unsplash (Costa del Sol area photos). Each zone links to `/sone/{slug}` (non-functional route for now — just the visual). Uses `SectionLabel`, serif heading, `overflow-x-auto scrollbar-hide` flex layout, and `rounded-full` image containers with `border-2 border-primary/20 hover:border-primary`.

Zones: Marbella, Nueva Andalucía, Puerto Banús, Golden Mile, Benahavís, Estepona, Mijas, Fuengirola.

Add `scrollbar-hide` utility class to `src/index.css` if not already present (`.scrollbar-hide::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none; scrollbar-width: none`).

### 2. Admin View Badge

**Modified: `src/pages/Admin.tsx`**

After the password gate is passed (`isAuthenticated === true`), render a fixed top-center badge: `fixed top-0 left-1/2 -translate-x-1/2 z-[60] bg-primary/90 text-white text-xs px-4 py-1 rounded-b-lg` with "⚙ Admin View" text.

### 3. Redesign Comparable Property Cards

**Modified: `src/components/ResultAnalysisGroup.tsx`**

Update the `ComparableCard` component to match the new design:
- Add a `Badge` (from `@/components/ui/badge`) showing distance (`X.X km away`) positioned absolutely on the image with `bg-background/80 backdrop-blur-sm`
- Restructure card body: price as `text-lg font-semibold`, property details line, area line
- Add a bottom `border-t` row with price/m² on left and a colored Badge showing the % difference vs lead property (green for cheaper, destructive for more expensive)
- Change card width to fixed `w-[280px] shrink-0` and make the parent container a horizontal scroll (`flex overflow-x-auto gap-5 pb-4 scrollbar-hide`) instead of a grid
- Rounded corners to `rounded-xl`

### 4. Update result section visual hierarchy

Already mostly done from previous work. Ensure all sections in `ResultAnalysisGroup.tsx` and `ResultAgentGroup.tsx` consistently use `py-8 sm:py-12 border-b border-border/50` (already applied in last iteration — verify and patch any gaps).

### Files

| Action | File |
|--------|------|
| Modified | `src/pages/Index.tsx` — add Explore Areas section |
| Modified | `src/index.css` — add scrollbar-hide utility |
| Modified | `src/pages/Admin.tsx` — add admin view badge |
| Modified | `src/components/ResultAnalysisGroup.tsx` — redesign ComparableCard + horizontal scroll |

