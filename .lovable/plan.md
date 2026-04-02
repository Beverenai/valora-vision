

# Enhance Team Cards + Add Sales Map to Agency & Member Pages

## Two Issues to Fix

### 1. Team Member Cards — Show More Info
Currently the "OUR TEAM" cards on the agency profile (`AgentProfile.tsx`) show: photo, name, role, star rating, and languages. The `agent_team_members` table also has `phone`, `email`, `bio`, and `whatsapp` but these are not displayed.

**Changes to `src/pages/AgentProfile.tsx` (team section ~lines 681-727):**
- Add email icon + truncated email below the role
- Add phone icon + phone number (or "Show number" button consistent with the rest of the page)
- Show a short bio snippet (first ~80 chars) if available
- Add a small "sales count" badge if the member has attributed sales (query `agent_sales` by `team_member_id`)

To get per-member sales counts, we need to fetch sales grouped by `team_member_id`. This can be done alongside the existing sales fetch — group the `recentSales` data in a `useMemo` to create a `Map<team_member_id, count>`.

### 2. Sales Map — Agency-Level and Per-Member
Currently the map and sales stats only show on the agency profile using `agent_sales` filtered by `professional_id`. Two improvements needed:

**A. Agency profile (`AgentProfile.tsx`):**
- Already has the map. No change needed — it already shows all sales for the agency's `professional_id`.

**B. Team member profile (`TeamMemberProfile.tsx`):**
- Currently fetches sales filtered by `team_member_id` but does NOT render a map, stats, or property cards.
- Add the same `AgentSalesStats`, `AgentPropertyMap`, and `AgentPropertyCards` components that are already used on `AgentProfile.tsx`.
- Lazy-load the map component, compute `mapCenter` from sales coordinates.

## Technical Details

### File: `src/pages/AgentProfile.tsx`
- In the team card rendering (~line 686-725), add: email with `Mail` icon, phone with `Phone` icon, bio snippet, and sales count badge
- Add a `useMemo` that groups `recentSales` by `team_member_id` to get per-member counts

### File: `src/pages/TeamMemberProfile.tsx`
- Import `AgentSalesStats`, `AgentPropertyCards`, and lazy-import `AgentPropertyMap`
- After existing content sections, add:
  - `<AgentSalesStats>` with the member's sales
  - `<AgentPropertyMap>` (lazy, with Suspense) when sales have coordinates
  - `<AgentPropertyCards>` with pagination
- Add `useMemo` for `mapCenter` calculation (same pattern as AgentProfile)

### No database changes needed
All data already exists — `agent_sales.team_member_id` links sales to team members.

