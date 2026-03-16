

## Plan: Horizontal Scissors Cut — Right to Left

### What
Change the sealed card's tear mechanic from a vertical left-side strip to a **horizontal cut line** running between "VALORACASA" (top) and "VALUED" (center). The scissors tab sits on the right edge at ~35% height and drags **left** across the card. The tear line is horizontal dashed. On tear, the top strip flies upward and the bottom section drops away.

### Changes — `src/components/shared/CardRevealWrapper.tsx`

**1. SealedWrapper — Replace vertical strip with horizontal top strip:**
- Remove the left 15% vertical strip entirely
- Add a horizontal top strip at ~35% of card height (between "VALORACASA" and "VALUED")
- The top strip contains "VALORACASA" centered
- The main body below contains "VALUED", dots, and "Property Valuation Report"
- Horizontal dashed line at the 35% boundary (border-bottom dashed on top strip)

**2. Pull tab — Move to right edge, horizontal center of card (~35% from top):**
- Position: `right: 0, top: 35%`
- Drag direction: `drag="x"` with constraints `{ left: -280, right: 0 }` (drag LEFT)
- Rounded-left pill shape (`rounded-l-xl`)
- Scissors icon oriented horizontally (no rotation), chevron pointing left
- Animate chevron left `x: [3, -3, 3]`
- Update instruction text: `← Slide to open`

**3. Drag progress effects:**
- `topStripY = dragProgress * -15` (top strip shifts up slightly as user drags)
- Glow line runs horizontally at the 35% mark
- `rotateX` tilt instead of `rotateY` on main body

**4. Tearing phase — Update tear animation:**
- Top strip flies **upward** (`y: -300, opacity: 0, rotateX: 25`)
- Bottom section stays briefly then drops **downward** in the sliding phase
- Sparkle/bubble particles originate from the horizontal cut line (center-X, 35% Y)

**5. Update SparkleParticle and PopBubble origins:**
- Change `left: "15%", top: "50%"` → `left: "50%", top: "35%"` to match new cut position

### Files Modified
- `src/components/shared/CardRevealWrapper.tsx`

