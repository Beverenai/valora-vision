

## Plan: Redesign "How It Works" — 2 Steps + Report Preview as Step 3

### Concept

Replace the current text-only "How It Works" section (3 steps) with a visually rich design inspired by the provided HTML. Steps 1 and 2 show mini interactive previews (address input mockup, property details pills). Step 3 is replaced by the existing "See What You'll Receive" flippable card section, merging the two sections into one cohesive flow.

### Changes — `src/pages/Index.tsx`

**1. Update `HOW_STEPS` data** — reduce to 2 entries (remove step 03).

**2. Replace the "How It Works" section (lines 260–307)** with a new design:
- Keep the header (SectionLabel + title + subtitle) with existing La Sala styling
- Vertical timeline connector line between steps (thin 1px border-border)
- Each step card:
  - Large `01`/`02` number in light weight, faded color
  - Icon circle (terracotta/rent-aware) with SVG icons (map pin for step 1, sliders for step 2)
  - Title + description text
  - Mini preview widget:
    - Step 1: Fake address input bar with placeholder text + location pin icon
    - Step 2: Pill badges showing "3 Beds", "2 Baths", "Size" like the HTML reference
  - Card has subtle `bg-card` with light border on desktop, full-width on mobile

**3. Merge "What You'll Receive" as Step 03:**
- Remove the standalone "What You'll Receive" section (lines 311–364)
- Add a third step card in the same timeline with number `03`, icon (sparkle/check), title "See what you'll receive"
- Below the step text, render the existing `ValuationTicketCard` flippable showcase (reuse exact same props)
- Keep the "Tap the card to see property details" hint

**4. Mobile adaptations (390px viewport):**
- Steps stack vertically, full-width cards
- Timeline connector line runs down the left side
- Step number + icon stay compact (smaller number font)
- Mini preview widgets scale to full card width
- ValuationTicketCard in step 3 renders at full width as it already does

**5. Remove the now-redundant `SectionDivider` between the old How It Works and What You'll Receive sections.**

### Visual Structure

```text
Desktop:                          Mobile (390px):
┌─────────────────────────┐       ┌──────────────────┐
│  HOW IT WORKS           │       │ HOW IT WORKS     │
│  Three Simple Steps     │       │ Three Simple...  │
│                         │       │                  │
│  01 ─── [card w/input]  │       │ 01               │
│  │                      │       │ ┌──────────────┐ │
│  02 ─── [card w/pills]  │       │ │ address bar  │ │
│  │                      │       │ └──────────────┘ │
│  03 ─── [ticket card]   │       │ 02               │
│         ↻ Tap to flip   │       │ ┌──────────────┐ │
└─────────────────────────┘       │ │ 3Bed 2Ba Size│ │
                                  │ └──────────────┘ │
                                  │ 03               │
                                  │ [ValuationCard]  │
                                  │ ↻ Tap to flip    │
                                  └──────────────────┘
```

### Files Modified
- `src/pages/Index.tsx` — restructure How It Works + merge What You'll Receive

