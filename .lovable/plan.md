

# Auto-Import Reviews During Onboarding

## What This Does
When an agency onboards and provides their website URL, we already scrape it with Firecrawl. We'll extend that to:
1. Find Google Reviews and Trustpilot links on their website
2. Scrape those review pages with Firecrawl
3. Use AI to extract individual reviews (name, rating, comment, date)
4. Insert them into `agent_reviews` with `source` tracking and `is_verified = true`

## Changes

### 1. Database Migration
Add `source` column to `agent_reviews` to track where reviews came from:
- `source TEXT DEFAULT 'manual'` — values: `manual`, `google`, `trustpilot`, `website`
- Add `source_url TEXT` for the original review page URL

### 2. Update `onboard-agency/index.ts`
After the existing website scrape (step 1), add a new step:

**Step 1b: Find review page links**
- From the already-scraped links array, detect:
  - Google: links containing `google.com/maps` or `business.google.com`
  - Trustpilot: links containing `trustpilot.com`
  - Also check the scraped markdown for embedded review text

**Step 2b: Scrape review pages**
- If Google/Trustpilot links found, scrape each with Firecrawl (markdown format)
- Limit to 1 URL per source to stay within credit budget

**Step 3b: Extract reviews with AI**
- Send scraped review page content to Lovable AI with tool calling
- Extract: `reviewer_name`, `rating` (1-5), `comment`, `source`
- Cap at 20 reviews per source

**Step 4b: Return reviews in result**
- Add `reviews: []` array to the onboard response
- The frontend (ProOnboard.tsx) will insert them into `agent_reviews` after profile creation

### 3. Update `ProOnboard.tsx` — handlePublish
After the professional is created, bulk-insert the returned reviews into `agent_reviews` with:
- `professional_id` from the newly created professional
- `is_verified: true` (imported from verified source)
- `source: 'google' | 'trustpilot'`

Add an onboarding step: "Importing reviews..." with count feedback.

### 4. Update `AgentProfile.tsx` — Review Display
Show a small badge on imported reviews indicating source (Google icon, Trustpilot icon) so visitors can see these are verified external reviews.

## Technical Details

### AI extraction prompt (tool calling)
```text
Extract individual reviews from this review page content.
Return reviewer name, rating (1-5), comment text, and approximate date.
```

### Review insert shape
```typescript
{ professional_id, reviewer_name, rating, comment, 
  is_verified: true, source: 'google', source_url: '...' }
```

### Files Modified
- `supabase/migrations/` — add `source` and `source_url` columns to `agent_reviews`
- `supabase/functions/onboard-agency/index.ts` — review scraping + AI extraction
- `src/pages/ProOnboard.tsx` — insert reviews on publish
- `src/pages/AgentProfile.tsx` — source badge on reviews

### Limitations
- Firecrawl may not capture all Google reviews (Google limits visible reviews)
- Trustpilot pages are usually scrapeable and contain more review text
- We cap at 20 reviews per source to avoid excessive AI token usage

