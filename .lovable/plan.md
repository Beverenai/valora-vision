

## Plan: Replace Rent with Buy — Two Primary Modes: SELL & BUY

### Summary
Remove Rent as a primary navigation item. The landing page toggle switches from **SELL / RENT** to **SELL / BUY**. Rent valuation pages stay in the codebase (existing leads still work via direct URL), but are hidden from navigation. The BUY feature is the new second pillar.

---

### Stage 1 — Database + Edge Function (Backend)

**New `buy_analyses` table** (migration):
- Columns: `id`, `source_url`, `source_platform`, `property_code`, `address`, `city`, `latitude`, `longitude`, `property_type`, `size_m2`, `rooms`, `bathrooms`, `asking_price`, `asking_price_per_m2`, `features` (JSONB), `thumbnail_url`, `image_urls` (text[]), `estimated_value`, `estimated_low`, `estimated_high`, `estimated_price_per_m2`, `area_median_price_per_m2`, `price_deviation_percent`, `price_score`, `confidence_level`, `comparables_count`, `comparable_properties` (JSONB), `feature_adjustments` (JSONB), `analysis`, `market_trends`, `email`, `status` (default 'pending'), `created_at`
- RLS: public insert + select (same as leads_sell)

**New edge function: `supabase/functions/analyze-listing/index.ts`**
1. Parse URL → extract property code + platform (Idealista `/inmueble/(\d+)/`, Fotocasa, Kyero)
2. Check `properties_for_sale` by `external_id`; if missing → scrape via Apify single-property mode
3. Insert into `buy_analyses` with `status: 'processing'`
4. Call `find_sale_comparables` RPC
5. Calculate median price/m², feature adjustments (reuse SELL multipliers), adjusted market value
6. `price_deviation_percent = ((asking_price - adjusted_value) / adjusted_value) × 100`
7. Price score: below_market (<-15%), good_value (-15 to -5%), fair_price (-5 to +5%), slightly_above (+5 to +15%), above_market (>+15%)
8. Confidence: high (15+), medium (8-14), low (3-7), insufficient (<3)
9. Call Lovable AI for neutral analysis text
10. Update row to `status: 'ready'`, return `{ analysis_id }`

---

### Stage 2 — Landing Page & Navigation Changes

**`src/pages/Index.tsx`**:
- Change state from `"sell" | "rent"` to `"sell" | "buy"`
- Replace SkyToggle labels: "Property Value" / "Analyze Listing" (or similar)
- When BUY selected:
  - Hero badge: "Free Price Analysis"
  - Headline: "IS THIS PROPERTY WORTH THE PRICE?"
  - Subtitle: "Paste a listing link and we'll compare it to the market"
  - ValuationTicketCard switches to a URL input mode (new prop) with placeholder URL
  - Platform logos below: Idealista · Fotocasa · Kyero · SpainHouses
  - CTA: "Analyze Property →"
- Replace `REPORT_FEATURES_RENT` with `REPORT_FEATURES_BUY` (Price Score, Price Spectrum, Comparable Analysis, Negotiation Hints, Area Insights, Agent Recommendations)
- Replace `TESTIMONIALS_RENT` with `TESTIMONIALS_BUY`
- Showcase card in BUY mode shows price score badge instead of "VALUED"
- Recent Valuations section adapts for BUY mode
- Final CTA adapts headline for BUY

**`src/components/Navbar.tsx`**:
- Change nav links: `Valuation` → `/sell/valuation`, `Buy Analysis` → `/buy`, `Lookup` → `/lookup`
- Remove "Rentals" link

**`src/components/Footer.tsx`**:
- Replace "Rental Estimate" link with "Buy Analysis" → `/buy`

**`src/components/ValuationTicketCard.tsx`**:
- Extend `accentType` and `valuationType` to `"sell" | "rent" | "buy"`
- Add a URL input mode: when `valuationType === "buy"`, render a URL paste field instead of Google address input
- New props: `listingUrl`, `onListingUrlChange`, `onAnalyzeClick`
- BUY accent color: use a blue-ish or distinct theme (or keep gold/terracotta)

**`src/components/ui/sky-toggle.tsx`**:
- Update default labels from "Property Value" / "Rent Income" to "Sell" / "Buy"

---

### Stage 3 — BUY Flow Pages

**`src/pages/BuyAnalysis.tsx`** (new, at `/buy`):
- Clean page with large URL input
- Platform detection on paste (shows detected platform icon)
- On submit → calls `analyze-listing` edge function
- Processing overlay with BUY-specific messages: "Fetching property details...", "Scanning the local market...", "Comparing with similar properties...", "Calculating fair market value..."
- On completion → navigate to `/buy/result/:id`

**`src/pages/BuyResult.tsx`** (new, at `/buy/result/:id`):
- Same CardRevealWrapper UX as SellResult
- Card shows: property image, asking price, PRICE SCORE badge (color-coded)
- Scrollable sections after reveal:
  1. **Price Verdict** — asking vs estimated, visual gauge bar, neutral text
  2. **The Numbers** — stats row: Asking Price | Estimated Value | Price/m² | Area Avg
  3. **Price Spectrum** — horizontal bar green→grey→red with markers for estimated and asking
  4. **Comparable Properties** — reuse comparable cards, color-coded (green=cheaper, red=pricier)
  5. **What Affects The Price** — feature impact from `feature_adjustments` JSONB
  6. **Area Insights** — median price/m², trend
  7. **Negotiation Hints** — context-aware text per price_score (neutral advisory tone)
  8. **CTAs** — connect with agent, share

---

### Stage 4 — Routing

**`src/App.tsx`**:
- Add routes: `/buy` → `BuyAnalysis`, `/buy/result/:id` → `BuyResult`
- Keep `/rent/*` routes (existing leads still accessible, just not linked)

---

### Files Created
- `supabase/functions/analyze-listing/index.ts`
- `src/pages/BuyAnalysis.tsx`
- `src/pages/BuyResult.tsx`

### Files Modified
- `src/pages/Index.tsx` — sell/buy toggle, new BUY content
- `src/components/ValuationTicketCard.tsx` — URL input mode for BUY
- `src/components/ui/sky-toggle.tsx` — updated labels
- `src/components/Navbar.tsx` — replace Rentals with Buy Analysis
- `src/components/Footer.tsx` — replace Rental Estimate with Buy Analysis
- `src/App.tsx` — new routes
- Database migration for `buy_analyses` table

### Implementation Order
Given the size, this should be implemented across multiple prompts:
1. Database migration + edge function
2. Landing page + navigation + ValuationTicketCard changes
3. BuyAnalysis page
4. BuyResult page

