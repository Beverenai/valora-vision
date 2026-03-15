

# ValoraCasa — Real Estate Valuation Platform

## Overview
A premium real estate valuation platform for international property owners in Spain. The platform offers free property valuations (sell) and rental income estimates (rent), then connects owners with top-rated local agents and property managers. All data is mock/static for now — no backend needed initially.

## Pages & Features

### 1. Landing Page (/)
- **Split Hero** with dark navy gradient background
- Two prominent path cards: **Sell** (blue accent) and **Rent** (teal accent) with hover expand effect
- Trust stats bar (12,400+ valuations, 45+ cities, Free)
- "How it Works" 3-step section with icons
- Testimonial cards (3 across)
- Coverage map section (static SVG map of Spain with highlighted zones)
- Full-width CTA banner
- Footer with links, legal, language selector

### 2. Sell Landing Page (/sell)
- Navy gradient hero with headline, stats counters (count-up animation)
- 3-step "How Your Valuation Works" section
- "What You'll Get" feature grid (4 cards)
- Testimonials section
- FAQ accordion
- Final CTA

### 3. Rent Landing Page (/rent)
- Similar structure to /sell but with rental-focused copy
- Teal accent instead of blue
- Short-term vs long-term income messaging

### 4. Multi-Step Valuation Form (/sell/valuation & /rent/estimate)
- 5-step form with top progress bar (navy-to-gold gradient)
- Step 1: Property type (large clickable icon cards)
- Step 2: Location (search input + manual dropdowns)
- Step 3: Property details (bedrooms/bathrooms with +/- selectors, size input)
- Step 4: Features (toggle switches for pool, garage, garden, etc.)
- Step 5: Contact info (name, email, phone)
- Smooth slide transitions between steps
- Selection tiles for options instead of standard inputs

### 5. Sale Result Page (/sell/result/:id)
- **Valuation Hero Card** — navy-to-blue gradient, large price range, confidence meter (segmented bar)
- Price trends line chart (12 months, teal line, area fill)
- Similar properties grid (4 PropertyCards with mock data)
- Top agents section with ProfessionalCards (1 recommended + 2 standard)
- Cross-sell banner to rental estimate (teal)
- Download PDF / Get Updates buttons
- Legal disclaimer

### 6. Rental Result Page (/rent/result/:id)
- Dual-column hero: Short-term (teal) vs Long-term (blue) income
- Monthly income bar chart
- Property manager cards instead of agent cards
- Cross-sell to sale valuation
- Tourist license info section

### 7. Professional Profile Page (/professional/:id)
- Hero banner with logo, ratings, verification badge
- Stats bar (4 metrics)
- Two-column: About/Specializations + Contact form
- Reviews section with load more

### 8. For Professionals Page (/for-professionals)
- Sales hero: "Get in front of motivated property owners"
- Mockup of how their card appears
- How it works section
- 3-tier pricing table (Stripe-style)
- Agent testimonial + FAQ + CTA

### 9. Professional Dashboard (/dashboard)
- Stats cards row with trend arrows
- Performance line chart (30 days)
- Zone performance table
- Recent reviews
- Subscription status card

## Shared Components
- **Navbar** — Logo, nav links (Sell, Rent, For Professionals, Blog), language selector, hamburger on mobile
- **Footer** — Links, legal, social, language
- **PropertyCard** — Image, beds, size, price, days on market
- **ProfessionalCard** — 3 variants (Premium/Featured/Listed) with gold ribbon for recommended
- **StatCard** — Icon + number + label with count-up animation
- **StepIndicator** — 4px gradient progress bar
- **TestimonialCard** — Quote + name + location
- **CTABanner** / **CrossSellBanner**
- **RatingStars**, **PriceBadge**, **ZoneBadge**, **LanguageBadge**

## Design System
- **Colors**: Navy #1E3A5F, Gold #D4A843, Teal #0D9488, Slate #64748B, Background #F8FAFC
- **Typography**: Plus Jakarta Sans (headings), Inter (body, data with tabular nums)
- **Radius**: 16px cards, 8px internal elements
- **Shadows**: Multi-stop soft shadows
- **Motion**: Expo-out curve, staggered fade-in entrances, hover lifts, shimmer loading states
- **Icons**: Lucide React

## Responsive
- Mobile-first: stacked layouts, full-width cards, hamburger nav, simplified charts
- All forms full-width with generous touch targets (48px+ inputs)

## Data
- All mock/static data — no backend integration needed for v1
- Realistic Spanish property data (Marbella, Nueva Andalucía, Ibiza, etc.)

