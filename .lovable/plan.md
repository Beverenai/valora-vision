

# Center "How It Works" Timeline + Add More Detail

## What Changes
The current timeline is left-aligned with the step numbers and content pushed to the left. We'll center the entire layout, expand descriptions, and add richer visual previews to better use the available space.

## Changes in `src/pages/Index.tsx` (lines ~290–465)

### 1. Center the layout
- Change the section content wrapper from left-aligned to `text-center` / `items-center`
- Each step becomes a centered column layout instead of a horizontal `flex gap` row
- Step number + icon circle centered above the content
- Remove the left-side vertical connecting line (doesn't work centered)
- Add a subtle horizontal or dotted connector between steps on desktop (optional)

### 2. Switch to 3-column grid on desktop
- Desktop: `grid grid-cols-3 gap-8` with each step as a centered card-like column
- Mobile: stack vertically as before
- Each column: large step number → icon circle → title → expanded description → visual preview

### 3. Expand content per step
- **Step 1** (Enter address / Paste link): Add detail like "Google-powered autocomplete with map verification" for sell/rent, or "Supports Idealista, Fotocasa, Habitaclia and more" for buy. Keep the address input mock visual but make it wider.
- **Step 2** (Property details / Market analysis): Add "Bedrooms, bathrooms, pool, terrace, parking — every detail that affects value" or "Our AI compares against hundreds of active and sold listings". Expand the property pills visual with more items (Pool, Terrace, Garage).
- **Step 3** (Get results): Add "Instant PDF report with price range, confidence score, comparable properties, and AI market summary. Share or download." Keep the text, remove the separate ValuationTicketCard below (or keep it centered below the grid).

### 4. Keep the flippable ValuationTicketCard
- Keep it below the 3-column grid as a centered showcase element
- No structural change to the card itself

### 5. Typography
- Section heading and subtitle: centered (already are)
- Step titles: slightly larger (`text-base` instead of `text-sm`), still uppercase bold
- Descriptions: `text-sm` or `text-base`, centered, `max-w-xs mx-auto`

## Files Modified
- `src/pages/Index.tsx` — restructure How It Works from left-aligned timeline to centered 3-column grid with richer descriptions

