

# Improve Agent Directory Page

## Current State
The page and route already exist at `/agentes` with lazy loading, search, filters, skeleton loading, JSON-LD, and a "load more" pagination pattern. The core functionality requested is largely implemented.

## Changes Needed

### 1. Enhanced hero subtitle
Update the subtitle to match the requested copy: "Verified agents across Costa del Sol — matched by proximity, reviews, and expertise"

### 2. Add missing municipalities to filter
Add "Nueva Andalucía", "Puerto Banús", "San Pedro" to `MUNICIPALITIES` array.

### 3. Add "Recently joined" sort option
Extend `sort` state type to include `"newest"` and add the option to the sort dropdown. Sort by `created_at` is not currently fetched — add it to the select query.

### 4. Agent card improvements
- Use terracotta (`bg-[#D4713B]`) for the initials fallback circle instead of `bg-primary`
- Make the entire card a clickable `Link` to the agent profile
- Show "New on ValoraCasa" when agent has no rating instead of "0.0 (0)"
- Display languages as uppercase badge chips instead of dot-separated text

### 5. Empty state improvement
Add a "Clear all filters" button that resets search, location, language, and sort state.

### 6. CTA banner for agents at bottom
Add a section before `Footer` encouraging agents to join, with links to `/pro` and `/pro#pricing`.

### 7. Mobile filter improvements
Add `overflow-x-auto flex-nowrap` to the filter bar for horizontal scroll on small screens. Wrap language badges in a scrollable container.

## Files Modified
- `src/pages/AgentDirectory.tsx` — all changes in this single file

