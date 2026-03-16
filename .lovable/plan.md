

## Plan: Complete Card Pack Opening Rewrite

Rewrite `src/components/shared/CardRevealWrapper.tsx` with all 8 changes from the request. Same file path (not `valuation/`), same props interface, same exports.

### Key Changes

**1. Opaque foil wrapper** — Replace transparent `rgba(accent, 0.05)` backgrounds with solid metallic gradients. Sell = gold/bronze (`#8B6914` → `#E8CC6E`), Rent = silver/teal (`#4A7C72` → `#9FD4C6`). Add embossed diamond pattern via `repeating-linear-gradient(45deg/−45deg)`. Card is invisible in sealed state.

**2. Tear from top, drag upward** — Move tear line to 15% from top. Pull tab at top-right, sticking up. Change `drag="x"` to `drag="y"` with `dragConstraints={{ top: -200, bottom: 0 }}`. Progress based on upward offset.

**3. Card slides out of wrapper** — Add 4th phase `"sliding"` between `"tearing"` and `"revealed"`. During sliding: card rises upward out of remaining wrapper bottom, wrapper bottom crumples and falls. Spring bounce on card arrival.

**4. Reduce particles** — Remove `BubbleTexture` entirely. Reduce `SparkleParticle` count from 20 → 10, `PopBubble` from 15 → 8. Add `will-change: transform` on animated elements. Use CSS `@keyframes` for the foil shine sweep infinite loop instead of framer-motion.

**5. Stronger holographic effect** — Rewrite `HoloShine` with full rainbow spectrum (`rgba(255,100,100)` → gold → green → blue → purple) that moves with tilt. Higher base opacity (0.7).

**6. Foil texture** — Add repeating diagonal line pattern at 3% white opacity on the foil wrapper body.

**7. Staggered tearing animation** — Implement the exact timing sequence: 0ms top strip flies up with curl → 100ms light burst → 200ms sparkles → 400ms card rises (sliding phase) → 600ms bottom wrapper falls → 800ms card spring bounce → 1000ms shine sweep → 1500ms scroll text.

**8. Floating shadow under revealed card** — Add a blurred shadow div beneath the card that shifts with `cardTilt.y`.

### Phase State Machine

```text
sealed → tearing (600ms) → sliding (800ms) → revealed
```

- `sealed`: Opaque foil pack, floating idle, pull tab at top
- `tearing`: Top strip curls up, light burst, sparkles (staggered)
- `sliding`: Card slides up out of wrapper, bottom falls away
- `revealed`: Card with 3D tilt, holo shine, confetti, shadow, report below

### Structure

All in one file. Sub-components: `SparkleParticle` (10 max), `PopBubble` (8 max), `LightBurst`, `SealedWrapper` (rewritten with foil), `HoloShine` (rainbow), main `CardRevealWrapper`.

### CSS animation for shine sweep

Add a `@keyframes foil-shine` in a `<style>` tag or inline via the component to avoid framer-motion overhead on the infinite loop.

### File
- `src/components/shared/CardRevealWrapper.tsx` — full rewrite

