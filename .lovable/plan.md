

# Fix: Make Team Member Cards Clickable on Company Profile

## Problem
The linking code already exists in `AgentProfile.tsx` — members with a `slug` get wrapped in a `<Link>` to `/agentes/:slug/:memberSlug`. However, the existing team members (e.g., "Sal" and "August raae" under La Sala Homes) have `slug = NULL` because they were created before the slug-generation feature was added.

## Solution

### 1. Database Migration — Backfill Slugs
Run a migration that generates slugs for all `agent_team_members` where `slug IS NULL`:
```sql
UPDATE agent_team_members 
SET slug = lower(regexp_replace(
  translate(name, 'áéíóúñÁÉÍÓÚÑ', 'aeiounAEIOUN'),
  '[^a-z0-9]+', '-', 'gi'
))
WHERE slug IS NULL;
```
Also add a `NOT NULL DEFAULT ''` or keep nullable but ensure the onboard function always sets it.

### 2. Update `onboard-agency/index.ts`
When team members are created during onboarding, auto-generate slugs from names (same logic as dashboard).

### 3. Update `publish-agent-profile/index.ts`
Same — when upserting team members, generate slugs if not provided.

## Files Modified
- `supabase/migrations/` — backfill existing null slugs
- `supabase/functions/onboard-agency/index.ts` — add slug generation for team members
- `supabase/functions/publish-agent-profile/index.ts` — add slug generation for team members

This is a small change — the UI linking already works, just the data is missing.

