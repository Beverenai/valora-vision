

## Plan: One-Pager Architecture with Address Input Hero + Cross-Sell

### What you described

1. **Two domains, same app** — one for "property value" (`/sell`), one for "rent income" (`/rent`). Each is a self-contained one-pager.
2. **Hero = address input first** — the Google Maps address search is the very first thing visitors see, not buried in the wizard.
3. **Section order** on each one-pager: Hero with address input → Social proof ("1,000+ people used this") → Real estate companies/logos → Testimonials → About the valuator → CTAs throughout.
4. **Cross-sell on results** — after completing a sell valuation, show rent income as a secondary result/CTA. Vice versa for rent.

### Architecture changes

**Routing stays the same** — `/sell` and `/rent` are the two one-pagers. The two custom domains will each point to one of these routes (configured via DNS/domain settings, not code). The current `Index` page (`/`) becomes a simple redirect or a minimal landing that links to both.

### File changes

#### 1. `src/pages/Index.tsx` — Simplify to a routing splash
Minimal page with two large action cards linking to `/sell` and `/rent`. Or redirect to `/sell` by default. This page is only seen if someone visits the root domain without a product-specific domain.

#### 2. `src/pages/Sell.tsx` — Full one-pager redesign
Rewrite as a complete one-pager with this section order:

1. **Hero** — Dark navy panel with headline + `GoogleMapsAddressInput` embedded directly. When user selects an address, store it and scroll to next section or navigate to `/sell/valuation` with the address pre-filled (via URL params or state).
2. **Social proof strip** — "1,000+ property owners have used this tool" with counter stats.
3. **Trusted by companies** — Logo grid of real estate companies (placeholder logos/names initially).
4. **Property Showcase Carousel** — Existing carousel component showing valued properties.
5. **Testimonials** — Existing testimonial cards.
6. **About the valuator** — New section explaining how the AI valuation works, data sources, accuracy.
7. **How it works** — Existing 3-step process.
8. **FAQ** — Existing accordion.
9. **Bottom CTA** — Final CTA banner.

Intersperse mini-CTAs between sections (small inline "Get your free valuation" links).

#### 3. `src/pages/Rent.tsx` — Same one-pager structure as Sell
Mirror the Sell page layout but with rent-specific copy, teal accent color, and rent-focused testimonials/data.

#### 4. `src/components/shared/GoogleMapsAddressInput.tsx` — No changes needed
Already a standalone component. Will be imported directly into the hero sections.

#### 5. `src/components/CompanyLogos.tsx` — New component
Grid of real estate company logos/names that use ValoraCasa. Structural grid style with 1px borders.

#### 6. `src/components/AboutValuator.tsx` — New component
Section explaining the valuation methodology — data sources, AI analysis, accuracy stats.

#### 7. `src/pages/SellResult.tsx` — Add rent cross-sell section
After the existing valuation results, add a prominent section: "Also curious about rental income?" with a CTA to `/rent/valuation` (pre-filling the same address if possible).

#### 8. `src/pages/RentResult.tsx` — Add sell cross-sell section
After the rental estimate, add: "Want to know your property's sale value?" with a CTA to `/sell/valuation`.

#### 9. `src/pages/SellValuation.tsx` & `src/pages/RentValuation.tsx` — Accept pre-filled address
Read address from URL search params or navigation state so that when users click "Get Valuation" from the hero, the first step is already populated.

### Technical details

- **Address pre-fill flow**: Hero → user enters address → click CTA → `navigate('/sell/valuation', { state: { address } })` → SellValuation reads `useLocation().state.address` and pre-fills the location step.
- **Cross-sell on results**: Add a new section component at the bottom of each result page that shows the "other" product's value teaser and a CTA button.
- **Two domains**: No code changes needed — both domains point to the same deployed app. The `/sell` and `/rent` routes handle the product separation. Domain configuration is done in project settings.
- **Inline CTAs**: Small `<Link>` bars between sections with gold accent styling, alternating between full-width dark panels and subtle text CTAs.

