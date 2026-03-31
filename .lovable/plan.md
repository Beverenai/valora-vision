

## Plan: Fix RLS Error on Agent Signup

### Problem
When email confirmation is required, `signUp` creates the user but doesn't establish an active session. The subsequent `insert` into `professionals` fails because `auth.uid()` is `null`, so the RLS policy `user_id = auth.uid()` rejects the row.

### Solution
Move the professional profile creation + role assignment to an **edge function** (`publish-agent-profile`) that runs with the **service role key**, bypassing RLS. The client sends the `user_id` and profile data to this function after signup.

### Changes

**1. Create edge function `supabase/functions/publish-agent-profile/index.ts`**
- Accepts: `user_id`, all profile fields, `team[]`
- Uses Supabase service role client to:
  - Insert into `professionals`
  - Insert into `agent_team_members`
  - Insert into `user_roles` (role = 'agent')
- Returns the created slug

**2. Update `src/pages/ProOnboard.tsx` → `handlePublish`**
- After `signUp`, call `supabase.functions.invoke('publish-agent-profile', { body: { user_id, ...profileData, team } })` instead of direct table inserts
- Remove the 3 direct insert calls (professionals, team members, user_roles)

### Files Created
- `supabase/functions/publish-agent-profile/index.ts`

### Files Modified
- `src/pages/ProOnboard.tsx` — replace direct inserts with edge function call

