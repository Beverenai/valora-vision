

## Plan: Horizontal Slide-to-Open + Orange/Green Theme Colors

Two changes to `CardRevealWrapper.tsx`:

### 1. Change drag direction back to horizontal (slide right/left)

**SealedWrapper:**
- Move tear line from top (15%) to the **right side** (vertical dashed line at ~85% from left)
- Pull tab moves to **right edge, centered vertically**, sticking out to the right
- Change `drag="y"` → `drag="x"`, `dragConstraints={{ left: 0, right: 200 }}`
- Progress based on rightward offset (`info.offset.x / 150`)
- Trigger tear when `info.offset.x > 80`
- Glow appears along the vertical tear line as user drags
- Instruction text changes to `"→ Slide to open"`
- Chevron icon changes from `ChevronUp` to `ChevronRight`

**Tearing phase:**
- Right strip flies **right** and curls (`rotateY: 45` instead of `rotateX: -45`)
- Left/main wrapper stays, then crumples in sliding phase

**Sliding phase:**
- Card slides **out to the right** (or rises up — keeps the upward spring, wrapper falls left)

### 2. Change color theme: sell = orange/terracotta, rent = green

**Sell foil gradient** (orange/terracotta):
```
linear-gradient(135deg, #8B4513 0%, #D4742B 25%, #C96A2C 40%, #E8A56E 55%, #B85E1E 70%, #D4742B 100%)
```

**Rent foil gradient** (green):
```
linear-gradient(135deg, #2D6A4F 0%, #52B788 25%, #40916C 40%, #74C69D 55%, #2D6A4F 70%, #52B788 100%)
```

**Sparkle/accent colors:**
- Sell: `["#D4742B", "#E8A56E", "#FF8C00", "#C96A2C"]`, RGB: `"212, 116, 43"`
- Rent: `["#52B788", "#74C69D", "#40916C", "#95D5B2"]`, RGB: `"82, 183, 136"`

**Tab colors:** sell = `bg-[#D4742B]`, rent = `bg-[#52B788]`

### File
- `src/components/shared/CardRevealWrapper.tsx` — update SealedWrapper drag axis, tear direction, all color values

