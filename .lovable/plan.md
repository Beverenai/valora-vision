

## Plan: Restyle Sealed Wrapper as Themed Plastic Wrap

### What Changes

Replace the silver metallic envelope with a **transparent-ish plastic wrap** effect that uses the project's theme colors (terracotta for sell, green for rent). The wrapper should look like a semi-transparent plastic film stretched over the card — think shrink-wrap or cellophane packaging.

### Visual Concept

- **Background**: Semi-transparent tinted overlay instead of opaque silver. Use the accent color at low opacity (e.g. `rgba(212,113,59,0.08)` for sell, `rgba(60,179,113,0.08)` for rent) with a glossy sheen effect
- **Plastic texture**: Subtle light reflections/streaks simulating plastic wrap — diagonal white highlight bands at very low opacity, plus a slight blur/frosted glass feel using `backdrop-blur`
- **Crinkle effect**: Faint wavy/crinkled lines using repeating CSS gradients to simulate plastic folds
- **Border**: Thin semi-transparent border in accent color instead of heavy metallic edges
- **Text**: "ValoraCasa" and "VALUED"/"ESTIMATED" in accent color (terracotta/green) at medium opacity instead of silver
- **Dots/dividers**: Accent color at low opacity
- **Pull tab**: Stays themed (already terracotta/green)
- **Tear line**: Accent-colored dashed line instead of grey

### Single File Change

**`src/components/shared/CardRevealWrapper.tsx`** — Update `SealedWrapper` sub-component:

1. Replace all silver/grey gradient backgrounds with:
   - Main body: `background: rgba(accent, 0.06)` + `backdrop-filter: blur(1px)` + glossy diagonal white streaks overlay
   - Plastic sheen: `linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.3) 45%, transparent 55%, rgba(255,255,255,0.15) 75%, transparent 90%)`
   - Crinkle texture: repeating thin diagonal lines at ~3% opacity

2. Replace embossed silver text with accent-colored text at 40-60% opacity

3. Update tear line border color to accent

4. Update tearing phase halves to match the new plastic look (tinted transparent instead of silver)

5. Keep all animation logic, drag behavior, and component structure identical

### Files
- `src/components/shared/CardRevealWrapper.tsx`

