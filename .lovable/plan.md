

# Auto-Seed Owner as Team Member

## Problem
August created his profile before the "insert owner as team member" logic was added to `publish-agent-profile`. The `loadTeam` function only queries `agent_team_members`, so he doesn't appear. Even going forward, if publish fails or is retried, the owner might not be seeded.

## Solution
Add a self-seeding check in `TeamTab.loadTeam()`: after fetching team members, if the current agent (owner) is not found in the results, automatically insert them into `agent_team_members` and reload.

### Changes in `src/pages/ProDashboard.tsx`

In `loadTeam()`, after fetching data:
1. Check if any row has `name === agent.contact_name` and `role === "Owner"` (or matches by email)
2. If not found, insert the owner as a team member:
   ```typescript
   await supabase.from("agent_team_members").insert({
     professional_id: agent.id,
     name: agent.contact_name,
     email: agent.email,
     phone: agent.phone || null,
     role: "Owner",
     sort_order: 0,
     is_active: true,
   });
   ```
3. Re-fetch the team after seeding

This is idempotent — runs once, then the owner exists for all future loads.

### Owner protection
The existing `handleToggleActive` and `handleRemoveMember` already protect members with role "Owner" from deactivation/removal — no change needed there.

## Files Modified
- `src/pages/ProDashboard.tsx` — add owner auto-seed in `loadTeam()`

