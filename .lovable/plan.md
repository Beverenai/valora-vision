

## Plan: Result Page Upgrade — Price Range, Area Comparison & Agent Matching

This upgrades the SellResult page with an enhanced valuation display, a new area comparison section, and real agent matching — replacing the hardcoded placeholder agent.

---

### 1. Database: Agent Matching RPC Function

Create a new migration with a `match_agents_by_location` RPC function:

```sql
CREATE OR REPLACE FUNCTION match_agents_by_location(
  p_lat double precision,
  p_lng double precision,
  p_limit integer DEFAULT 3
) RETURNS TABLE (
  id uuid, company_name text, slug text, logo_url text,
  tagline text, bio text, avg_rating numeric, total_reviews integer,
  is_verified boolean, languages text[], website text,
  distance_km double precision
)
```

This queries `professionals` joined with `professional_zones` → `zones` (which have `center_lat`/`center_lng`), calculates distance using the Haversine formula, and returns the closest active professionals sorted by rating and proximity.

No new tables needed — all data exists.

---

### 2. Upgrade: `ValuationResultCard` → Price Range Bar

Replace the current two-line price display with:
- Large centered estimated value (midpoint)
- Visual range bar showing low–estimate–high with a dot marker
- Confidence badge (green HIGH / amber MEDIUM / red LOW) based on comparable count
- Tooltip explaining ±15% range
- Keep monthly rental and weekly high season below

---

### 3. New Section: `AreaComparisonSection`

Insert after Comparable Properties, before Market Trends. Three horizontal comparison bars:

- **Price/m²**: user's `price_per_sqm` vs area median (calculated from comparables)
- **Size**: user's `built_size_sqm` vs area average
- **Bedrooms**: user's bedrooms vs area average

Each bar shows the user's value, area average, and percentage difference with color coding (green = above average, terracotta = below).

Data source: computed client-side from the `comparable_properties` array already stored on the lead.

---

### 4. Upgrade: `ProfessionalSpotlight` → `MatchedAgentsSection`

Replace the single hardcoded agent with a section showing up to 3 real agents:

- On mount, call `supabase.rpc('match_agents_by_location', { p_lat, p_lng })` using the lead's coordinates
- Each agent card: logo (initials fallback), name, tagline, star rating, review count, distance, languages, verified badge
- Primary CTA: "Contact [Name]" → opens a contact modal
- Secondary: "View Profile" → `/agentes/:slug`
- Below cards: "See all agents in [city]" link
- If no agents found: hide section gracefully

**Contact Modal**: Dialog with name, email, phone, message (pre-filled with property address). Inserts into `agent_contact_requests`. Privacy note below submit.

---

### 5. Upgrade: AI Analysis Prompt

In `calculate-valuation/index.ts`, enhance the analysis prompt to include real comparable data:

```
"Based on ${comparables.length} comparable properties within 5km...
Comparable price range: €${min}–€${max}.
Area median price/m²: €${medianPricePerSqm}.
Your property's price/m² of €${pricePerSqm} is X% above/below the median..."
```

This makes the AI output data-driven instead of generic.

---

### 6. Comparable Cards Upgrade

Update existing `ComparableCard` to add:
- **Similarity score** progress bar (calculated from size match + room match + distance)
- **Price color coding**: green if comp price/m² is lower, terracotta if higher, gray if within ±10%
- Show 6 cards by default with "View all X" expandable

---

### Files Modified

- `src/pages/SellResult.tsx` — upgrade ValuationResultCard, add AreaComparisonSection, replace ProfessionalSpotlight with MatchedAgentsSection + contact modal, upgrade ComparableCard
- `supabase/functions/calculate-valuation/index.ts` — enhance AI prompt with real comp data
- 1 new migration — `match_agents_by_location` RPC function

### Implementation Order
1. Database migration (agent matching RPC)
2. Upgrade SellResult.tsx sections (all UI changes in one file)
3. Upgrade AI prompt in edge function

