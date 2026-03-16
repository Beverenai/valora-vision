

## Plan: Elevated Editorial Design — Floating Logos, No Borders, Designer Sections

### Problem
The page looks boxy and template-like: heavy `border-t` dividers between every section, plain rectangular cards in grids, and agency names listed as flat text. The editorial magazine aesthetic is lost.

### Changes

**1. `src/pages/Index.tsx` — Full visual overhaul**

- **Remove all `border-t border-border`** from every section — use whitespace and subtle background shifts instead
- **Trusted By section**: Replace the plain text list with a floating, staggered layout using `framer-motion` — each agency name floats at a slightly different Y offset and opacity, with gentle hover animations. No box, no border, just names drifting in space with varying sizes and opacities
- **How It Works**: Remove the boxed cards. Instead, use a clean numbered list with large step numbers (`text-6xl` font-light), title, and description flowing inline — no background cards, no borders, just typography and whitespace
- **Report Features (What you get)**: Replace the grid of identical rounded boxes with a staggered, asymmetric layout — alternating left/right alignment, varying card sizes, some with just text (no background), some with a faint accent tint. Use `motion.div` with viewport-triggered fade-in at different delays
- **Testimonials**: Already decent (no card), keep as-is
- **Final CTA**: Remove `border-t`, keep the gradient — it's already good
- **Recent Valuations**: Remove `border-t`, keep the section otherwise

**2. Floating agency logos treatment**

```text
Current:  Engel & Völkers    Sotheby's    Panorama    DM Properties ...
          (flat row, equal weight, boring)

New:      Engel & Völkers         Sotheby's
                    Panorama
             DM Properties      Terra Meridiana
                       Drumelia
                La Sala Estates
          (scattered, varying opacity 20-40%, subtle float animation)
```

Each name gets:
- Random-ish X offset (predefined, not truly random)
- `opacity` between 0.2 and 0.4
- Gentle `animate={{ y: [0, -6, 0] }}` with staggered duration (3-5s)
- Font size varies slightly between names

**3. How It Works — typographic layout**

Replace boxed cards with a minimal layout:
- Large `01` / `02` / `03` in light weight, oversized
- Title + description flowing next to number
- Thin horizontal hairline between steps (1px, very faint)
- No background cards, no shadows

**4. Report Features — editorial scatter**

Replace uniform grid with:
- 2-column layout on desktop, but cards have varying visual treatment
- Some cards: icon + text only (transparent bg)
- Some cards: very light terracotta-tinted bg
- Staggered `motion.div` entrance with `whileInView`
- No uniform rounded-2xl boxes

