

## Plan: Apply Reference Layout & Spacing System — Section by Section

Keep all existing components (ValuationTicketCard, PropertyShowcaseCarousel, testimonials, etc.) untouched. Only adjust spacing, padding, dividers, and visual hierarchy in `src/pages/Index.tsx`.

### What we learn from the reference design

The reference uses a disciplined spatial system:
- **Consistent horizontal padding**: `px-5` (20px) on mobile, `px-8` on desktop
- **Thin dividers** (`border-b border-[#E8E5E0]`) between every major section — this is what makes it feel organized
- **Tighter vertical rhythm**: `py-8` / `py-10` on mobile instead of `py-14` — less dead space
- **Section headers**: small uppercase label + action link on opposite side
- **Stats bar pattern**: key numbers in a horizontal row separated by vertical dividers
- **Sticky bar with context**: not just a button, but a "Selected unit" line above it

### Changes to `src/pages/Index.tsx`

**1. Page wrapper** — Add consistent `px-5 md:px-8` to the outer container and a max-width for desktop (`max-w-[1200px] mx-auto`)

**2. Hero section** — Reduce from `min-h-screen` to `min-h-[85vh]` on mobile so the user sees a hint of the next section. Tighten internal gaps.

**3. Add thin dividers between every section** — A `<div className="border-b border-[#E8E5E0] mx-5 md:mx-8" />` element between each major section. This is the biggest visual hierarchy improvement from the reference.

**4. Section padding normalization**:
- Current: `py-14 md:py-32` (56px / 128px) — too much on mobile
- New: `py-8 md:py-20` (32px / 80px) — tighter but still breathable

**5. Section headers** — Where applicable (Recent Valuations, Report Features), adopt the reference pattern: left-aligned title + right-aligned "See all" or subtitle, using `flex justify-between items-baseline`.

**6. Stats bar** — Add a new horizontal bar between "How it works" and "What you get" sections showing three key stats (e.g., "12,400+ Valuations", "2 min Average", "100% Free") separated by thin vertical dividers. This replaces the scattered "12,400+ valuations · 100% free · 2 minutes" text.

**7. Sticky CTA enhancement** — Add a context line above the button: "Get your free property valuation" in small muted text, matching the reference's "Selected unit / The Glass House" pattern.

**8. Desktop containment** — Wrap all sections in a `max-w-5xl mx-auto` container so content doesn't stretch edge-to-edge on wide screens.

### Files changed
- `src/pages/Index.tsx` — spacing, padding, dividers, section header alignment, stats bar, sticky CTA context line

### No changes to
- `ValuationTicketCard.tsx`
- `PropertyShowcaseCarousel.tsx`
- Any other component
- Colors, fonts, brand elements

