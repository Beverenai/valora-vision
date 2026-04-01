

# BUY: Link vs Link — Property Comparison Feature

## Overview

Add the ability for users to paste two listing URLs and get a side-by-side comparison with AI-generated insights on which property offers better value.

## Changes

### 1. Database: New `buy_comparisons` table

```sql
CREATE TABLE buy_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_a_id UUID REFERENCES buy_analyses(id),
  analysis_b_id UUID REFERENCES buy_analyses(id),
  ai_comparison TEXT,           -- AI narrative comparing both
  ai_winner TEXT,               -- "a", "b", or "tie"
  ai_comparison_points JSONB,   -- structured comparison bullets
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

RLS: public read (no auth required, matches existing buy_analyses pattern).

### 2. New edge function: `compare-listings/index.ts`

Accepts `{ url_a, url_b }`. Flow:
1. Call `analyze-listing` internally for both URLs in parallel (reuses all existing logic — scrape/cache, comparables, valuation, AI)
2. Wait for both to reach `ready` status (poll if needed)
3. Build a comparison data package with both properties' results
4. Call AI with a `generate_comparison_analysis` tool:
   - `winner`: which property is better value ("a", "b", or "tie")
   - `summary`: 2-3 sentence comparison overview
   - `comparison_points[]`: 4-6 structured bullet comparisons (price, value/m², features, location)
   - `recommendation`: neutral recommendation text
5. Store in `buy_comparisons`, return `comparison_id`

### 3. Update `BuyAnalysis.tsx` — Add compare mode

Add a toggle or tab: "Analyze One" vs "Compare Two". In compare mode:
- Show two URL input fields side by side (Property A / Property B)
- Both get platform detection badges
- Single "Compare Properties" button
- Loading overlay with comparison-specific messages
- On success, navigate to `/buy/compare/:id`

### 4. New page: `BuyCompare.tsx` (`/buy/compare/:id`)

Side-by-side comparison result page:
- **Header**: "Property A vs Property B" with winner badge
- **Split view**: Two property cards with thumbnail, address, asking price, estimated value, price score
- **Comparison table**: Size, rooms, price/m², deviation %, features — with visual indicators showing which is better per metric
- **AI comparison section**: Structured comparison points + recommendation
- **Individual reports**: Link to each property's full `/buy/result/:id` page
- Share button for the comparison

### 5. Route registration in `App.tsx`

Add `/buy/compare/:id` route with lazy-loaded `BuyCompare` page.

## Files Modified/Created

- New migration SQL (`buy_comparisons` table + RLS)
- `supabase/functions/compare-listings/index.ts` (new edge function)
- `src/pages/BuyAnalysis.tsx` — add compare mode toggle + dual URL inputs
- `src/pages/BuyCompare.tsx` (new page)
- `src/App.tsx` — add route

## Technical Notes

- The compare function reuses `analyze-listing` for each URL, so all existing scraping, valuation, and AI logic is inherited
- Both analyses run in parallel for speed
- The AI comparison call only fires after both individual analyses are complete
- Comparables may overlap if properties are in the same zone — this is expected and useful context for the AI

