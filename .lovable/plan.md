

## Plan: Orange Selection Styling + Sell Intent Question

### 1. Fix broken `--gold` references → use `--primary` (orange/terracotta)

The CSS variable `--gold` doesn't exist in `index.css`. All components using `hsl(var(--gold))` render invisible/fallback colors. Replace every `--gold` reference with `--primary` across:

- **`SellDetailsStep.tsx`** — `PillSelector` (bedrooms/bathrooms pills)
- **`SellFeaturesStep.tsx`** — `SelectableCard` (condition cards), orientation pills

### 2. Orange text in PropertyTypeSelector dropdowns

In `PropertyTypeSelector.tsx`, the category icons and descriptions use `text-muted-foreground` (gray). Change the icon color on selected items to use `text-primary` (orange) so selected state feels more branded.

### 3. Replace "Selling Timeline" with intent-based flow in `SellContactStep.tsx`

Current: A single "Selling Timeline" dropdown.

New flow:
- **Question**: "Do you want to sell the property?" with two pill buttons: **Yes** / **No**
- **If Yes**: Show the timeline dropdown (same options as now)
- **If No** ("I just wanted the value"): Show "Are you looking for refinancing?" with **Yes** / **No** pills

This requires two new fields in `SellValuationData`:
- `wantsToSell: string` (`"yes"` | `"no"` | `""`)
- `interestedInRefinancing: string` (`"yes"` | `"no"` | `""`)

Add these to `types/valuation.ts` and `INITIAL_SELL_DATA`. The `sellingTimeline` field stays but is only shown when `wantsToSell === "yes"`.

### Files changed
- `src/components/sell/SellDetailsStep.tsx` — replace `--gold` → `--primary`
- `src/components/sell/SellFeaturesStep.tsx` — replace `--gold` → `--primary`
- `src/components/shared/PropertyTypeSelector.tsx` — orange icon on selected
- `src/components/sell/SellContactStep.tsx` — new intent flow replacing timeline dropdown
- `src/types/valuation.ts` — add `wantsToSell`, `interestedInRefinancing` fields

