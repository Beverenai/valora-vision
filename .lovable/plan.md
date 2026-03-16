

## Plan: Fix Card Opener + Share Details

### 1. Card Opener — Keep Within Card Bounds (CardRevealWrapper.tsx)

The current pull tab sits at `right: "-12px"` and drags rightward up to 200px — going off-screen on mobile (320px card on 390px viewport). Fix: move the tab to the **left edge** of the card, drag it rightward but only across the card width (~320px). The tear line moves from 85% to 15%.

**SealedWrapper changes:**
- Pull tab: `left: "0px"` instead of `right: "-12px"`, rounded-l-xl, positioned inside the card
- Drag constraints: `{ left: 0, right: 280 }` — stays within card width
- Threshold lowered: trigger tear at `offset.x > 100` (about 1/3 card width)
- Progress calc: normalize over card width (`/ 280`)
- Tear strip: move from right side to left side (`left: 0` instead of `right: 0`)
- Tear dashed line: `left: "15%"` instead of `left: "85%"`
- Glow: reposition to 15%
- Scissors/chevron: flip direction (ChevronRight stays, scissors rotate adjusted)
- Instruction: "Slide to open →"
- Sparkle/pop particles: change `left: "85%"` to `left: "15%"` in SparkleParticle and PopBubble

**Tearing phase changes:**
- The strip that flies away starts on the **left** and flies left (`x: -300`)
- Main wrapper remains on the right
- Adjust positions to match 15% strip width on left

**Sliding phase:**
- Main wrapper crumples rightward instead of leftward (or just fades — simpler)

### 2. Share with Valuation Details (SellResult.tsx + RentResult.tsx)

**SellResult `handleShare`:**
```typescript
navigator.share({
  title: `Property Valuation – ${lead?.address}`,
  text: `My property at ${lead?.address} is valued at ${fmt(estimatedLow)} – ${fmt(estimatedHigh)}.`,
  url: window.location.href
});
// Clipboard fallback includes same text + URL
```

**RentResult `handleShare`:**
```typescript
navigator.share({
  title: `Rental Estimate – ${lead?.address}`,
  text: `My property at ${lead?.address} could earn ${fmt(monthlyEstimate)}/mo.`,
  url: window.location.href
});
```

### Files Modified
- `src/components/shared/CardRevealWrapper.tsx` — tab position, drag bounds, tear line, particles
- `src/pages/SellResult.tsx` — share text with address + price range
- `src/pages/RentResult.tsx` — share text with address + monthly estimate

