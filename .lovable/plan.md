

## Plan: Apply Structural Grid Design System Across the Site

The uploaded reference defines a clear design language: **structural grids with 1px borders**, editorial typography, dark navy panels with gold accents, and image cells with overlays. Currently, the site uses rounded cards with shadows and gradient blobs. This plan applies the reference design to the **homepage (Index), Sell landing, and Rent landing pages**. The result page components already partially follow this language.

### Design tokens (Tailwind utility classes)

```text
Structural grid:    grid gap-[1px] bg-border border border-border
Panel (white):      bg-card (or bg-white)
Panel (dark):       bg-gradient-to-br from-[#1E3A5F] to-[#0F172A] text-white
Label:              text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground
Data huge:          text-[4.5rem] font-light tracking-[-0.04em] leading-none
Data large:         text-[2.5rem] font-light tracking-[-0.02em]
Accent line:        h-0.5 bg-gold (absolute top-0 left-0 right-0)
Image cell:         bg-muted min-h-[300px] relative overflow-hidden
Overlay box:        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/80 p-6 bg-navy/85 backdrop-blur-sm text-white text-center
Body padding:       p-6 (24px)
Dot background:     bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] bg-[length:24px_24px]
```

### Files to modify

#### 1. `src/index.css` — Add dot-grid background
Add the radial-gradient dot pattern to `body` as in the reference (subtle dot grid on the light background).

#### 2. `src/pages/Index.tsx` — Full redesign to structural grid
Replace the current rounded-card hero with the reference layout:
- **Hero grid** (`grid-cols-2`): Left = dark navy panel with "Residential Data" gold label, large heading, body text, footer meta. Right = split vertically: top = image cell with overlay box ("Market Intelligence / Accuracy, Resolution, Trust"), bottom = split horizontally: Sell action card + Rent action card (with blue/teal accent lines and hover states).
- **Stats grid** (`grid-cols-4`): Three stat cells with huge numbers + one dark text cell. Replace StatCard with inline structural cells.
- Remove "How it Works" rounded cards — replace with structural grid panels if kept, or simplify.
- Testimonials and Coverage sections adapted to use 1px border panels instead of rounded cards.
- CTA section as a full-width dark panel.

#### 3. `src/pages/Sell.tsx` — Structural grid redesign
- Hero: Dark navy panel (full width or split) with heading + gold CTA button. No gradient blobs.
- Stats: Inline structural grid stats (not StatCard components).
- How it works: 3-column structural grid with step indicators in panel headers (like the form step bar in reference).
- Features: Grid of bordered panels instead of rounded cards.
- FAQ: Clean panels with 1px borders (keep Accordion but restyle container).
- CTA: Dark full-width structural panel.

#### 4. `src/pages/Rent.tsx` — Same structural grid treatment as Sell
Mirror the Sell page approach with teal accent color instead of blue.

#### 5. `src/components/Navbar.tsx` — Structural header
Replace current navbar with the reference header style: max-w-1400, bottom border (2px solid navy), clean text links, no rounded elements. Logo left, nav links + Sign In button right.

#### 6. `src/components/Footer.tsx` — Minimal structural footer
Clean 1px top border, structural grid layout for footer columns.

#### 7. `src/components/StatCard.tsx` — Remove or replace
The structural grid uses inline stat cells. Either remove this component or refactor it to render as a borderless panel cell (no rounded corners, no shadow).

#### 8. `src/components/TestimonialCard.tsx` — Restyle
Remove rounded corners and shadows. Use 1px border panels with accent line on top for featured testimonials.

#### 9. `src/components/CTABanner.tsx` — Restyle
Replace rounded gradient card with a full-width dark navy panel using the structural grid pattern.

### What stays the same
- All routing, data fetching, Supabase integration unchanged.
- Result page components (`src/components/result/*`) already follow the structural grid — no changes needed.
- Form wizard pages (SellValuation, RentValuation) can be updated separately if desired.

### Scope
- ~9 files modified
- No new dependencies
- No database changes

