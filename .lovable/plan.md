

## Plan: Replace Feedback with "Higher or Lower?" Gamification + Fix Build

### What
Remove the "Was this valuation helpful?" feedback section. Replace it with a fun, branded "Higher or Lower?" prediction game placed right after the card reveal scroll-down. Also fix the build error from missing component files.

### Changes

**1. Fix Build Error**
The `ComparablePropertiesSection.tsx` and `PropertyFeaturesSection.tsx` files exist but the build can't find them — likely needs a forced re-save/touch of the files to clear Vite's cache. Will re-save both files unchanged.

**2. `src/pages/SellResult.tsx` — Remove FeedbackSection, Add PredictionGame**

**Remove:**
- The entire `FeedbackSection` component (lines 227-278) — delete it
- Remove unused imports: `ThumbsUp`, `Meh`, `ThumbsDown`, `Send`, `Textarea`
- Remove `<FeedbackSection>` usage (line 436) and its divider

**Add new `ValuationPredictionGame` inline component:**
- Placed right after the comparable properties section (before Professional Spotlight)
- Shows: "Did you think it would be..." with the gold accent line above
- Two large tap targets side by side: **↑ Higher** and **↓ Lower** with `ArrowUp`/`ArrowDown` icons
- Styled with brand theme: gold border on selected, `bg-accent/10` highlight, uppercase tracking labels
- On selection, animates in a response:
  - If "Higher": "Many owners are surprised — your property is performing well against the market."
  - If "Lower": "Great instinct — the Costa del Sol market has been rising steadily."
- Uses `Sparkles` icon and a gentle `animate-fade-in` on the response text
- Stores the guess to `valuation_feedback` table (reuses existing table with `rating: 5` for higher, `rating: 1` for lower, and `comment: "prediction:higher"` or `"prediction:lower"`)

**Component structure:**
```
<section py-16>
  <div max-w-md mx-auto text-center>
    <gold-line />
    <label "YOUR PREDICTION" />
    <p "Did you think it would be..." />
    <div flex gap-4>
      <button ↑ Higher />  
      <button ↓ Lower />
    </div>
    {selected && <animated response text>}
  </div>
</section>
```

### Files Modified
- `src/pages/SellResult.tsx` — remove FeedbackSection, add PredictionGame, fix imports
- `src/components/result/ComparablePropertiesSection.tsx` — re-save to fix build
- `src/components/result/PropertyFeaturesSection.tsx` — re-save to fix build

