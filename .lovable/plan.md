

# ValoraCasa — Full Platform Build Plan

## Current State
Phase 1 is complete: design system (colors, typography, Tailwind config), landing page (/), Navbar, Footer, StatCard, TestimonialCard, CTABanner. Dependencies like framer-motion, recharts, zod, react-hook-form are already installed.

## Build Order (8 phases)

This is a large platform. Each phase builds on the previous and delivers a working increment. Given Lovable's message limits, I recommend building **Phase 2 first** (Sell + Rent landing pages), then proceeding phase by phase.

---

### Phase 2 — Sell & Rent Landing Pages
**Files:** `src/pages/Sell.tsx`, `src/pages/Rent.tsx`
- Sell page: navy gradient hero, 3 stat counters with count-up, 3-step how-it-works, 4-card "What You'll Get" grid, 3 testimonials, FAQ accordion (shadcn Accordion), final CTA
- Rent page: same structure with teal accent, rental-focused copy (short-term vs long-term messaging)
- Add routes in App.tsx: `/sell`, `/rent`

### Phase 3 — Multi-Step Valuation Forms
**Files:** `src/pages/SellValuation.tsx`, `src/pages/RentValuation.tsx`, `src/components/form/` (shared step components)
- 5-step forms with shared step container and progress bar (navy-to-gold gradient)
- Step 1: Property type selector (large clickable icon cards)
- Step 2: Location (dropdowns for region/city/area — no Google Places for MVP)
- Step 3: Property details (+/- selectors for beds/baths, m² input)
- Step 4: Features (toggles, radios — sell-specific vs rent-specific)
- Step 5: Contact gate (name, email, phone, timeline radio, terms checkbox)
- Smooth slide transitions via framer-motion AnimatePresence
- Zod validation per step, inline error messages
- On submit: generate a mock ID and redirect to result page
- Routes: `/sell/valuation`, `/rent/valuation`

### Phase 4 — Mock Data & Shared Components
**Files:** `src/data/mockData.ts`, `src/components/PropertyCard.tsx`, `src/components/ProfessionalCard.tsx`, `src/components/RatingStars.tsx`, `src/components/CrossSellBanner.tsx`
- Mock data: 10 Costa del Sol zones, 30 sale properties, 20 rentals, short-term rental stats, 8 professionals (5 agents + 3 managers), 15 reviews
- PropertyCard: image placeholder, type, beds, size, price, days on market
- ProfessionalCard: 3 variants (Premium with gold border + recommended badge, Featured medium, Listed compact)
- RatingStars, PriceBadge, ZoneBadge, LanguageBadge components

### Phase 5 — Result Pages
**Files:** `src/pages/SellResult.tsx`, `src/pages/RentResult.tsx`
- **Sale result:** Valuation hero card (navy-blue gradient, price range, confidence meter), 12-month price trend line chart (Recharts), comparable properties grid (4 PropertyCards), recommended agents section (ProfessionalCards sorted by tier), cross-sell to rental, disclaimer
- **Rental result:** Dual-column hero (short-term teal / long-term blue), monthly income bar chart with long-term line overlay, comparable rentals, property manager cards, cross-sell to sale, tourist license info
- Routes: `/sell/result/:id`, `/rent/result/:id`

### Phase 6 — Professional Profile & For Professionals
**Files:** `src/pages/ProfessionalProfile.tsx`, `src/pages/ForProfessionals.tsx`
- **Profile page:** Hero banner, logo, ratings, verified badge, stats bar (4 metrics), two-column layout (about/specializations + contact form), reviews section with load more
- **For Professionals:** Sales hero, mockup screenshot, how-it-works, 3-tier pricing table (Premium/Featured/Listed), testimonial, FAQ, CTA
- Routes: `/professional/:id`, `/for-professionals`

### Phase 7 — Blog, About & Static Pages
**Files:** `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/pages/About.tsx`
- Blog listing with card layout (placeholder posts), individual blog post template
- About page with mission, team placeholders, trust signals
- Routes: `/blog`, `/blog/:slug`, `/about`

### Phase 8 — Professional Dashboard (Authenticated)
**Files:** `src/pages/Dashboard.tsx`, `src/pages/DashboardProfile.tsx`, `src/pages/DashboardReviews.tsx`, `src/pages/DashboardSubscription.tsx`
- Dashboard layout with side/top nav
- Stats cards (impressions, clicks) with trend arrows
- Performance line chart (Recharts, 30 days)
- Zone performance table
- Profile editor, reviews viewer, subscription management (mock)
- Routes: `/dashboard`, `/dashboard/profile`, `/dashboard/reviews`, `/dashboard/subscription`
- No real auth for now — mock logged-in state

### Cross-cutting (added incrementally)
- Cookie consent banner (Phase 2)
- SEO meta tags via document.title + meta description (each page)
- Disclaimer bar on result pages (Phase 5)
- i18n preparation: extract all strings to constants files for future translation

---

## Recommendation
**Start with Phase 2** (Sell + Rent landing pages) since they're the next logical step and relatively self-contained. Then Phase 3 (forms) and Phase 4 (mock data + components) can be built together, followed by Phase 5 (results) which ties everything together.

Supabase database setup is deferred until the UI is complete — all data is mock/static for now.

