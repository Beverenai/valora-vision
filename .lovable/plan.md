

## Plan: Features Showcase, Comparables Section, and Editorial Text Refinements

This is a multi-stage plan. Stage 1 focuses on what we can build now with existing data. Stage 2 outlines future enhancements.

---

### Stage 1 — Immediate Changes (SellResult.tsx)

**1. Property Features Section (new)**
Display the user's submitted features (from `lead.features` — stored as comma-separated text, plus `hasPool`/`hasGarage` booleans from the features field) with icons in a clean grid layout. Each feature gets a small icon + label pill, similar to the La Sala "Features & Amenities" collapsible but rendered as a flat visual grid of tags with icons.

- Parse `lead.features` (comma-separated string like "private pool, roof terrace, wine cellar")
- Map common keywords to Lucide icons (pool → `Waves`, garage → `Car`, terrace → `Fence`, garden → `TreePine`, gym → `Dumbbell`, elevator → `ArrowUpDown`, etc.)
- Render as a centered grid of small icon+label items with generous spacing
- Place this section between PropertySummaryCard and ValuationResultCard
- Section header: small uppercase label "What Makes It Special"

**2. AI Analysis Section — Always Open**
- Remove the `expanded` toggle state — show all paragraphs always
- Keep the drop-cap on first paragraph
- Adopt La Sala text style: larger line-height (`leading-[2]`), lighter font weight, more paragraph spacing (`mt-8` between paragraphs instead of `mt-6`)
- Add an italic serif subtitle/pull-quote extracted from the first sentence, displayed above the body text in `font-serif italic text-lg`

**3. Market Trends Section — Collapsible**
- Wrap chart + text in a toggle (collapsed by default)
- Show only the section header + a "View market trends" button
- When expanded, reveal chart with smooth animation

**4. Comparable Properties Section (new)**
- Use the existing `lead.comparable_properties` JSONB data (already stored with: `id`, `price`, `price_per_sqm`, `built_size_sqm`, `bedrooms`, `bathrooms`, `property_type`, `address`, `city`, `distance_km`, `image_urls`, `listing_url`)
- Create a horizontal scroll carousel of comparable property cards
- **Front of card**: Property image (from `image_urls[0]`, fallback to placeholder), price, address, city
- **Back of card** (flip on tap): Show matching attributes — bedrooms, bathrooms, built size, price/m², distance — with check marks for attributes that match the user's property
- Cards use the ValuationTicketCard visual language (rounded, shadow, gold accents) but simplified
- Section header: "Comparable Properties" with count
- Place after Market Trends, before Professional Spotlight

**5. Text & Spacing Refinements (La Sala style)**
- Analysis paragraphs: `text-[15px] leading-[2] text-foreground/70 font-light` — lighter, more airy
- More vertical space between sections (`py-16 md:py-24`)
- Thin 1px `bg-border` hairlines between sections (already present, keep)

### Stage 2 — Future Enhancements (not in this implementation)
- Fetch live property images via scraping or Resales Online API for comparables
- Add a "Feature Impact" section showing estimated value added per feature (e.g., "+€85,000 Pool")
- Interactive comparable card that links to the original listing URL
- RentResult page parity — add comparable rentals section using `comparable_rentals` JSONB

---

### Files Modified
- `src/pages/SellResult.tsx` — all changes above

