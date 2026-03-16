

## Plan: Apply Reference Design Improvements to Index Page

Enhance the existing landing page with premium design patterns observed in the reference screenshots. All changes in `src/pages/Index.tsx` only.

### Changes

**1. Hero — Larger mobile typography + better hierarchy**
- Headline: `text-4xl md:text-6xl` (up from 3xl/5xl) for more editorial impact
- Subtitle: `text-base md:text-lg` with `text-white/60` (more visible)
- More vertical gap between elements (`gap-8` instead of `gap-6`)

**2. Hero — Frosted glass trust stats bar**
- Wrap trust stats in a frosted glass container: `bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10 px-6 py-4`
- Stats displayed as distinct columns with dividers between them
- Gives the stats block visual weight and separation from the CTA

**3. Hero — Pill buttons with arrow icons**
- Add `ArrowRight` icon inside a small circle on each sell/rent button
- Layout: text + small circular icon container on the right
- Active state: filled circle with arrow, inactive: subtle border circle

**4. New: Valuation report preview mockup (between "How it works" and "What you get")**
- A frosted glass card showing a mock valuation result: address, estimated value (€850,000), a simple bar chart made with divs, and "AI Confidence: 94%" badge
- Tilted slightly with CSS transform for depth (`rotate-1 hover:rotate-0`)
- Heading above: "See what you'll get" with subtitle "A preview of your personalized report"

**5. Spacing & polish**
- Increase section padding: `py-20 md:py-28` on key sections
- Add subtle gradient mesh overlay on the "What you get" section background
- Testimonial section: add quotation mark decorative element (`"` in large amber/10 text behind quote)

### Sections remain the same (7 + sticky CTA), just visually elevated.

