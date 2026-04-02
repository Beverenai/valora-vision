

# Keep Dialog Open + Show Loading Cards While Enriching

## What Changes

Currently, when an agent submits a link, the dialog closes immediately and the sale card appears with no data (blank photo, no details). The agent must close/reopen the dialog to add another sale.

**New behavior:**
1. After submitting a link, the dialog stays open and the URL field clears — ready for the next link
2. In the sales grid behind the dialog, newly added sales that are still being enriched show as **skeleton/loading cards** (pulsing placeholder for photo, shimmer text lines)
3. Once enrichment completes, the card auto-updates with the real data (photo, price, details)

## Implementation

### 1. `AddSaleDialog.tsx` — Stay open after link submit
- After successful insert + enrichment trigger, clear the URL field but **do not** call `onOpenChange(false)`
- Still call `onSaleAdded()` so the parent refreshes the list
- Show a small inline success message ("Added! Importing details...") instead of closing

### 2. `SalesSection.tsx` — Loading state for enriching cards
- Add an `enriched` field check: a sale is "still loading" when it has a `listing_url` but no `city`, no `photo_url`, and no `property_type` (all null = not yet enriched)
- For these cards, render a skeleton variant: pulsing gray image area, shimmer text lines, a small "Importing..." label
- Set up a **polling interval** (every 8 seconds) that re-fetches sales while any card is in the "enriching" state, so data appears automatically when the edge function finishes
- Stop polling once all cards have data

### 3. Files to change

| File | Change |
|------|--------|
| `src/components/dashboard/AddSaleDialog.tsx` | Don't close dialog after link submit; clear URL field; show inline "Added" feedback |
| `src/components/dashboard/SalesSection.tsx` | Add skeleton card variant for un-enriched sales; add polling interval while enriching |

No database or edge function changes needed.

