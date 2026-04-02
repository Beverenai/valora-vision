

# Individual Team Member Profile Pages

## What This Does
Each team member gets their own public profile page at `/agentes/:company-slug/:member-slug`, similar to RealAdvisor's agent pages. The company page (`/agentes/:slug`) remains the agency overview, and each team member card links to their individual page showing their personal sales, stats, bio, and a contact form — all within the context of their parent agency.

## Current State
- Team members exist in `agent_team_members` table but have no individual pages
- Team member cards on the agency profile are static (no links)
- Sales are tied to `professional_id` only — no team member attribution

## Changes

### 1. Database Migration
Add columns to `agent_team_members`:
- `slug TEXT` — URL-friendly identifier (generated from name)
- `bio TEXT` — personal description
- `phone TEXT` already exists
- `whatsapp TEXT` already exists

Add column to `agent_sales`:
- `team_member_id UUID` — optional link to the team member who made the sale

### 2. New Route: `/agentes/:slug/:memberSlug`
Add a new route in `App.tsx` that renders a new `TeamMemberProfile` page component.

### 3. New Page: `src/pages/TeamMemberProfile.tsx`
Inspired by the RealAdvisor layout:
- **Hero**: Agency cover photo with member's personal photo overlaid (like RealAdvisor)
- **Name + role + languages**
- **Agency card**: Links back to parent company page
- **Sales statistics**: Properties sold count, median price, breakdown by type
- **Sold properties grid**: Cards with SOLD badge, photo, type, price, date
- **Contact form**: "Contact [Name]" sticky sidebar card, submits to `agent_contact_requests`
- **Reviews**: Show reviews linked to this member (if any)

### 4. Update `AgentProfile.tsx` — Team Section
Make each team member card clickable, linking to `/agentes/${professional.slug}/${member.slug}`.

### 5. Update `AddSaleDialog.tsx` — Team Member Attribution
Add an optional "Attributed to" dropdown showing team members, saving `team_member_id` on the sale.

### 6. Auto-generate slugs
When team members are created/updated, generate a slug from their name (e.g., "David Manso Torres" → "david-manso-torres"). Handle in the frontend on save.

## Technical Details

### Route structure
```text
/agentes/la-sala-homes              → Agency profile (existing)
/agentes/la-sala-homes/david-manso  → Team member profile (new)
```

### Sales query for member page
```sql
SELECT * FROM agent_sales 
WHERE professional_id = :agency_id 
  AND team_member_id = :member_id
ORDER BY sale_date DESC
```

### Files Modified
- `supabase/migrations/` — add `slug`, `bio` to `agent_team_members`; add `team_member_id` to `agent_sales`
- `src/App.tsx` — add route `/agentes/:slug/:memberSlug`
- `src/pages/TeamMemberProfile.tsx` — new page component
- `src/pages/AgentProfile.tsx` — make team cards linkable
- `src/components/dashboard/AddSaleDialog.tsx` — add team member dropdown
- `src/pages/ProDashboard.tsx` — add slug generation for team members, bio field in team editing

