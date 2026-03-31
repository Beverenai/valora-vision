

## Plan: Wizzair-Inspired Design Updates

Apply a modern, clean aesthetic inspired by Wizzair across the landing page — gradient hero, bolder CTAs, tighter typography hierarchy.

---

### Changes

**1. `src/index.css` — New CSS variables + gradient tokens**
- Add `--hero-gradient-sell` and `--hero-gradient-buy` custom properties for hero backgrounds
- Remove the default serif heading rule (`h1-h6 { font-family: DM Serif Display }`) — headings will use `Plus Jakarta Sans` by default via Tailwind's `font-heading` class, with DM Serif Display used selectively for italic accent phrases only
- Add a `--gold-dark` variable if missing (for hover states on CTA buttons)

**2. `src/pages/Index.tsx` — Hero section redesign**
- Wrap the hero in a gradient background: warm terracotta gradient for SELL mode, cool blue gradient for BUY mode (subtle, from top to transparent)
- Remove the badge pill ("Free Property Valuation") — replace with a small uppercase label
- Make the h1 use `font-heading` (Plus Jakarta Sans) consistently — keep the italic DM Serif accent on "really" and "worth the price" 
- Enlarge the CTA area: add a visible standalone CTA button below the ValuationTicketCard with prominent styling (large, rounded-full, with arrow icon)
- Tighten spacing: reduce `min-h-[85vh]` to `min-h-[75vh]`, reduce gaps

**3. `src/pages/Index.tsx` — Section headings consistency**
- All section h2s already use `font-sans font-black uppercase` — keep this
- Reduce italic subtitle font size from `text-xl` to `text-lg` for tighter hierarchy
- Make section labels slightly bolder

**4. `src/components/Navbar.tsx` — Cleaner navbar**
- Add a prominent CTA button in the nav ("Get Valuation" or "Start Free") styled as a filled button with `bg-primary text-white rounded-full px-5 py-2`
- Replace the "Sign In" text with the CTA button on desktop

**5. `src/components/CTABanner.tsx` & `src/components/InlineCTA.tsx` — Bigger CTA buttons**
- Make buttons `rounded-full` with larger padding and a subtle shadow
- Add `text-base` instead of `text-sm`

**6. `src/components/CrossSellBanner.tsx` — Rounded CTA button**
- Same treatment: `rounded-full`, larger padding

---

### Technical Details

**Hero gradient implementation** (in Index.tsx):
```
style={{ 
  background: isSell 
    ? 'linear-gradient(180deg, hsl(21 62% 53% / 0.06) 0%, transparent 60%)' 
    : 'linear-gradient(180deg, hsl(210 60% 45% / 0.06) 0%, transparent 60%)' 
}}
```

**Typography hierarchy** (tightened):
- h1: `font-heading text-4xl md:text-7xl font-black` (unchanged)
- h2: `font-heading text-3xl md:text-5xl font-black` (slightly smaller than current 4xl/6xl)
- Subtitles: `text-lg` (down from `text-xl`)
- Body: `text-base` (unchanged)

**Nav CTA button**: Replaces "Sign In" placeholder with an actionable button that links to `/#hero` or scrolls to the ValuationTicketCard.

### Files Modified
- `src/index.css` — remove default serif heading rule
- `src/pages/Index.tsx` — hero gradient, tighter spacing, subtitle sizes
- `src/components/Navbar.tsx` — add CTA button
- `src/components/CTABanner.tsx` — rounded-full buttons
- `src/components/InlineCTA.tsx` — rounded-full buttons
- `src/components/CrossSellBanner.tsx` — rounded-full buttons

