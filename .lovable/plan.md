

# Enhanced Team Management: AI-Extracted Agents + Invite Flow + Individual Landing Pages

## Overview
Three interconnected improvements to the team system:
1. AI scraper extracts richer agent data (email, phone, role) during onboarding
2. Editable team list in onboarding Step 3 with full contact details
3. Invite system in the dashboard Team section (send invite link or do it later)
4. Each agent gets their own profile page linked to the company

## Changes

### 1. Enhance AI Team Extraction (Edge Function)
**File: `supabase/functions/onboard-agency/index.ts`**

Update the AI tool-call schema to extract more fields per team member:
```typescript
// Current: { name, role }
// New: { name, role, email, phone, whatsapp }
```

Update the prompt to explicitly ask for email addresses, phone numbers, and WhatsApp numbers found on the website alongside each person's name and role.

### 2. Expand TeamMember Interface + Onboarding UI
**File: `src/pages/ProOnboard.tsx`**

- Extend `TeamMember` interface: add `email`, `phone`, `whatsapp` fields
- In Step 3 (Review), make each team member an editable card with fields for name, role, email, phone
- Add "Add team member" button to manually add members
- Add "Remove" button per member
- The agency owner (the person onboarding) is automatically included as the first team member with role "owner"

### 3. Update `agent_team_members` Table
**Migration:**
```sql
ALTER TABLE agent_team_members 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp text;
```

The table already has `email` and `phone` columns.

### 4. Update Publish Edge Function
**File: `supabase/functions/publish-agent-profile/index.ts`**

Include `email`, `phone`, `whatsapp`, `is_active` when inserting team members. Also insert the owner as the first team member.

### 5. Dashboard Team Section — Invite + Active Toggle
**File: `src/pages/ProDashboard.tsx`**

Replace the "Coming soon" invite button with a working flow:
- **Invite dialog**: Form with name, email, phone, role fields. On submit, inserts into `agent_team_members` with `is_active = true`
- **Active/inactive toggle**: Switch on each team member card (admins only). Updates `is_active` in the database
- **Owner protection**: Owner cannot be deactivated or removed
- Remove the hardcoded "ownerEntry" prepend — instead, the owner is stored as a real `agent_team_members` row during publish
- Show active members first, inactive members greyed out

### 6. Agent Landing Pages
Each team member in `agent_team_members` gets a link to their profile. Since they don't have their own `professionals` record yet (they haven't signed up), their info shows on the agency's profile page under the team section. The existing `AgentProfile.tsx` already loads and displays `agent_team_members` — no change needed there.

When an agent accepts an invite and creates their own account (future feature), they get their own `professionals` record linked via `agency_id`, and their `agent_team_members` entry can be linked or replaced.

## Implementation Order
1. Migration: add `is_active` and `whatsapp` columns
2. Edge function: enhance AI extraction schema
3. Edge function: update publish to include owner + richer team data
4. ProOnboard: expand TeamMember, editable team cards in Step 3
5. ProDashboard: invite dialog, active toggle, remove owner prepend hack

## Files Modified
- `supabase/functions/onboard-agency/index.ts` — richer AI extraction
- `supabase/functions/publish-agent-profile/index.ts` — save email/phone/whatsapp/is_active, include owner
- `src/pages/ProOnboard.tsx` — editable team cards with contact info
- `src/pages/ProDashboard.tsx` — invite dialog, active toggle, clean up owner logic
- 1 migration for `is_active` + `whatsapp` columns

