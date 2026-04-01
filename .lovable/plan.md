

# How It Works: Vertical Layout + Agent Matching Step

## What Changes
1. Switch the 3-column grid back to a vertical stacked layout (steps going downward) with a connecting line between steps
2. Add a 4th step: "Get matched with top local agents" — highlighting that users get connected with the best agents in their area for a full overview

## Changes in `src/pages/Index.tsx`

### 1. Vertical layout
- Replace `grid grid-cols-1 md:grid-cols-3` with a single-column vertical layout
- Each step: large number left + content right (on desktop), or stacked centered (mobile)
- Thin vertical connecting line between steps using a pseudo-element or border
- Alternating visual placement (step visual left/right) for visual interest on desktop

### 2. Add Step 04 — Agent Matching
- Icon: `Users` from lucide-react
- Title: "Get the best agents in your area"
- Description: "We match you with top-rated, verified local agents so you get a complete picture — from valuation to sale. Compare agents, read reviews, and choose with confidence."
- Visual mock: 2-3 overlapping agent avatar circles with star ratings and a "Matched in your area" badge

### 3. Update heading
- Change "Three Steps" → "Four Steps" in the section heading
- Update subtitle to mention agent matching

### 4. Keep the flippable ValuationTicketCard showcase below

## Files Modified
- `src/pages/Index.tsx` — restructure How It Works to vertical + add step 4

