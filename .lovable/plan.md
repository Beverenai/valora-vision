

## Plan: Redesign Landing Page with Estate Atlas Spatial System

### Inspiration Analysis
The reference design uses a clear visual hierarchy through:
- **Full-bleed hero image** with overlay content (badge, title, features as bullet chips)
- **Horizontal scroll cards** for browsing with image + text
- **Stat bars** with thin vertical dividers between key numbers
- **Bottom sticky bar** with context + CTA
- **Generous whitespace** with thin 1px dividers between major sections
- **Chip/badge pattern** for labels ("FEATURED", "Video Tour", "Concierge Pick")

### Changes

**1. `src/pages/Index.tsx` — Full redesign using reference spatial patterns**

**Hero section** — Replace current centered text + ticket card with a full-width featured property card:
- Full-width rounded image (aspect-ratio ~16/10 on mobile) with gradient overlay
- "ValoraCasa" brand + "FEATURED" badge overlaid top-left
- Property type label + headline overlaid bottom
- Three bullet-point features below image (like "Panoramic shoreline views")
- Three small dot indicators at the bottom of the hero
- Below the image card: the address input + CTA button

**Browse/showcase section** — Replace "Recent Valuations" with horizontal scroll cards:
- Section header with "Browse Properties" + "See all" link pattern
- Horizontally scrollable cards: tall image + title + description + badges
- Each card: rounded-2xl, image top half, text bottom half

**Discovery/editorial section** — Replace "What you get" section:
- Two-column split: left = large rounded image with overlay chips ("Video Tour", "Concierge Pick"), right = editorial text paragraph
- Mobile: stacks vertically

**Stats bar** — New section replacing part of "How it works":
- Three stats in a row separated by thin vertical dividers
- Large bold value, small label above (e.g., "Price / €1.2M", "Beds / 4 BR", "Sqft / 3,200")

**Bottom sticky CTA** — Enhance existing:
- Show "Selected unit" context text + "Book viewing" / "Get Your Free Valuation" button
- Rounded top corners, subtle shadow

**2. General spatial system applied throughout**
- Section padding: `py-6` on mobile, `py-12` on desktop (tighter than current `py-14`)
- Thin `border-b border-[#E8E5E0]` dividers between sections (1px, warm gray)
- Max-width: `max-w-[390px] md:max-w-[800px] lg:max-w-[1200px]` for content areas
- Cards use `rounded-2xl` or `rounded-3xl`, no heavy shadows — just `shadow-sm`
- Badge chips: `rounded-full px-3 py-1 text-xs font-medium bg-black/5`

**3. Desktop adaptation**
- Hero card becomes a wider 2-column layout: image left (60%), content right (40%)
- Browse cards become a grid of 3 across instead of horizontal scroll
- Stats bar spreads wider with more breathing room
- Discovery section side-by-side at `md:` breakpoint

**4. Keep existing functionality**
- Address input + navigation to `/sell/valuation` — unchanged
- Testimonial auto-rotation — keep
- Sticky mobile CTA — enhance with context line
- PropertyShowcaseCarousel — integrate into the browse section or keep as-is

**5. `src/components/ValuationTicketCard.tsx` — No changes**
Keep the ticket card component as-is; it will still be used on result pages. The landing page hero will use a new layout pattern inspired by the reference instead.

