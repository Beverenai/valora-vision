

# Remove Popular Areas Section from Frontpage

## Change
Delete the "Explore Areas" section (lines 701–727) from `src/pages/Index.tsx`. This removes the horizontal scrollable row of circular area thumbnails (Marbella, Benahavís, etc.).

No other files affected — the `/sone/:slug` routes remain intact for direct navigation.

## Files Modified
- `src/pages/Index.tsx` — remove lines 701–727

