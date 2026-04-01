

# Add Merit Score and Action Items to Dashboard Overview

## What This Does

Enhances the `OverviewSection` in `ProDashboard.tsx` by adding a Merit Score card with circular progress visualization and breakdown metrics, plus contextual Action Items that guide agents to complete their profile — both placed above the existing "Recent Leads" card.

## Changes

### 1. Update OverviewSection props

Add `setSection` callback so action item buttons can navigate to other sections (profile, zones).

```typescript
function OverviewSection({ agent, leads, impressionsCount, onViewLeads, setSection }: {
  agent: Professional; leads: Lead[]; impressionsCount: number; 
  onViewLeads: () => void; setSection: (s: Section) => void;
})
```

### 2. Add Merit Score card

Insert above the "Recent Leads" card:
- Gradient card with terracotta accent border
- Left side: score label, large number (62), percentile text
- Right side: SVG circular progress ring (strokeDasharray based on score)
- Bottom: 5-column grid showing sub-scores (Proximity, Rating, Response, Conversion, Profile)

Static values for now — will be computed from real data in a future iteration.

### 3. Add Action Items card

Contextual prompts based on agent profile completeness:
- Missing bio → "Add a company description" (+15 merit points)
- Missing logo → "Upload your logo" (+20 merit points)  
- Always show → "Select your service zones" (required for visibility)

Each item has an icon, description, merit point incentive, and a button that navigates to the relevant section.

### 4. Wire setSection in render

Pass `setSection` prop to `OverviewSection` at line 1143.

## Files Modified

- `src/pages/ProDashboard.tsx` — expand OverviewSection with Merit Score + Action Items, update caller to pass `setSection`

