

## Plan: Redesign Landing Page with Estate Atlas Spatial System

### What we're doing
Redesigning `src/pages/Index.tsx` to adopt the Estate Atlas design language: generous spacing, thin dividers, full-bleed hero card, horizontal browse cards, stats bar, and a discovery/editorial section. Mobile-first but properly scaled for desktop.

### Changes

**1. `src/pages/Index.tsx` — Full rewrite**

Replace the current page with these sections in order:

**Hero** — Full-width featured property card (rounded-3xl, aspect 16/10 mobile, wider on desktop) with gradient overlay, "ValoraCasa" + "FEATURED" badge overlaid, property features as bullet chips below image, then address input + CTA underneath.

**Browse Properties** — Header row ("Browse Properties" / "See all →"). Horizontal scroll on mobile, 3-col grid on desktop. Each card: tall rounded-2xl image, title, description snippet, badge chips ("2 Bed", "Urban"). Uses existing `PROPERTIES` data from PropertyShowcaseCarousel.

**Discovery/Editorial** — Split layout: left = large rounded image with overlay chip badges ("Video Tour", "Free Report"), right = editorial paragraph about the service. Stacks vertically on mobile.

**Stats Bar** — Three metrics in a row separated by thin vertical 1px dividers: "Valuations / 12,400+", "Accuracy / 97%", "Time / 2 min". `border-y border-[#E8E5E0]` top and bottom.

**Testimonials** — Keep existing auto-rotating testimonial with stars and dot indicators. Tighten padding.

**Final CTA** — Keep existing gradient CTA section with address input.

**Sticky mobile bar** — Enhanced: "Free Property Valuation" context line + "Get Valuation" button.

**Spatial system applied throughout:**
- Section padding: `py-6 md:py-16`
- Thin `border-b border-[#E8E5E0]` dividers between every section
- Content max-width: `max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto`
- Cards: `rounded-2xl` / `rounded-3xl`, `shadow-sm`
- Chips/badges: `rounded-full px-3 py-1 text-xs font-medium bg-black/5`

**2. No changes to `ValuationTicketCard.tsx`** — keep as-is for result pages.

**3. No changes to routing** — same `/` route, same navigation to `/sell/valuation`.

**Desktop scaling:** Hero card becomes max-w-5xl with image left (60%) + content right (40%). Browse becomes 3-col grid. Stats bar gets more horizontal breathing room. Discovery section goes side-by-side at `md:`.

