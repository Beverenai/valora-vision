

## Plan: Editorial Redesign of Result Pages

### What
Strip down the text-heavy result pages to a spacious, modern newspaper aesthetic. Remove footers, remove the rent cross-sell banner (rental income is already displayed), and dramatically reduce text density.

### Changes

**1. `src/pages/SellResult.tsx` — Spacious editorial overhaul**

- **Remove Footer** import and usage (lines 4, 443, 482)
- **Remove CrossSellBanner** import and the entire cross-sell section (lines 17, 476-478)
- **AIAnalysisSection** — Truncate to first paragraph only with a "Read more" toggle. Add a large drop-cap on the first letter. More whitespace (`py-12 md:py-16`)
- **MarketTrendsSection** — Remove the wall of text. Keep only the chart with a one-line summary stat above it. Full-width chart, generous padding
- **ProfessionalSpotlight** — Simplify: remove the long services grid and blockquote. Keep avatar, name, tagline, rating, and two buttons. Tighter, cleaner card
- **PropertySummaryCard** — Increase spacing between cells, larger values, remove the border-heavy grid look. Use a cleaner horizontal scroll on mobile
- **ValuationResultCard** — More breathing room: larger type for the price range, remove the icon clutter, let the numbers speak
- **ValuationHero** — Simplify: remove the placeholder image panel. Single centered section with address and price. Minimal buttons
- **FeedbackSection** — Keep but add more top margin for separation
- **ValuationDisclaimer** — Keep, add generous top padding

**2. `src/pages/RentResult.tsx` — Same treatment**

- Remove Footer import and usage
- Remove CrossSellBanner import and usage
- Keep reference code badge and card reveal

**3. General styling principles across both files**

- Replace `border-b border-border` section dividers with whitespace (`py-12 md:py-16`) and occasional thin hairlines
- Increase font sizes for key numbers
- Reduce paragraph text — one paragraph max per section, not three
- More `max-w-2xl mx-auto` centering for text blocks

### Files Modified
- `src/pages/SellResult.tsx`
- `src/pages/RentResult.tsx`

