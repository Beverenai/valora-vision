

# Agent vs Agency Architecture + Cover Photo Fix

## What This Does

1. **Fixes cover photo saving** — adds `cover_photo_url` to the Professional interface so it's properly typed and included in data flow
2. **Introduces Agency/Agent separation** — agencies (companies) and agents (individuals) coexist in the `professionals` table, linked by a new `agency_id` column. An agency can have 10-15+ agents. Each agent gets their own profile page AND appears on the agency page.

## Database Changes (1 migration)

Add two columns to `professionals`:
```sql
ALTER TABLE professionals ADD COLUMN agency_id uuid REFERENCES professionals(id) ON DELETE SET NULL;
ALTER TABLE professionals ADD COLUMN agency_role text DEFAULT NULL; -- 'owner', 'admin', 'agent'
```

- `agency_id`: nullable FK pointing to the agency record (type='agency') this agent belongs to
- `agency_role`: 'owner' (created the agency), 'admin' (can manage agency profile), 'agent' (member only)
- Existing records remain type='agent' with no agency_id (solo agents)

Update RLS: agents with `agency_role` in ('owner','admin') can update the agency row.

## Code Changes

### 1. Fix cover_photo_url in Professional interface
Add `cover_photo_url: string | null` to the interface in ProDashboard.tsx, ProOnboard.tsx, and AgentProfile.tsx. Remove all `(agent as any).cover_photo_url` casts.

### 2. ProDashboard — Agency Profile section
- Load the agency record if `agent.agency_id` is set (or if `agent.type === 'agency'`)
- Add a new "Company Profile" section (or integrate into existing Profile section) where owners/admins can edit company-level fields: company_name, logo, cover_photo, description, office_address, website, social links
- The existing "My Profile" becomes the personal agent profile: contact_name, bio, photo, phone, languages, personal slug

### 3. ProOnboard — Agency awareness
- After Step 1, ask: "Are you registering as an agency or as an individual agent?"
- If agency: create a professionals row with type='agency', agency_role='owner'
- If individual: create with type='agent' (current behavior)
- Agency owners can later invite agents from the dashboard

### 4. AgentProfile page — Show agency context
- If viewing an agent who has an `agency_id`, show the agency name/logo as context
- If viewing an agency, show all agents belonging to it as the "team"

### 5. AgentDirectory — Show both
- Show agencies with their agent count
- Show individual agents with their agency badge (if applicable)

## Implementation Order
1. Migration: add `agency_id` + `agency_role` columns
2. Fix `cover_photo_url` in all interfaces (quick fix)
3. Update ProDashboard with agency profile editing
4. Update ProOnboard with agency/agent choice
5. Update AgentProfile to show agency context + team from real agents
6. Update AgentDirectory

## Files Modified
- `src/pages/ProDashboard.tsx` — fix interface, add agency profile section
- `src/pages/ProOnboard.tsx` — fix interface, add agency/individual choice
- `src/pages/AgentProfile.tsx` — fix interface, show agency context
- `src/pages/AgentDirectory.tsx` — show agency badge
- `supabase/functions/publish-agent-profile/index.ts` — accept agency_role/agency_id
- 1 new migration for the schema changes

