

# Restructure Profile into Tabs: My Profile, Team, Company

## Problem
The current "My Profile" section shows company details mixed with personal details. We need three distinct tabs and proper role-based access control.

## Architecture

**Profile section gets 3 tabs:**
1. **My Profile** — personal agent info (contact_name, bio, phone, photo, languages, personal social links)
2. **Team Members** — list of agents belonging to this agency, with ability for admin/owner to invite or remove. Solo agents see this too (just themselves + ability to add team)
3. **Company Profile** — company-level data (company_name, logo, cover_photo, description, office_address, website, tagline, social links). Only editable by owner/admin roles.

**Role-based access:**
- `agency_role = 'owner'` or `'admin'`: can edit all 3 tabs
- `agency_role = 'agent'` (team member): can only edit "My Profile" tab. Company Profile and Team tabs are read-only
- Solo agents (no agency_id, type='agent'): can edit all tabs (they are effectively owner of their own profile)

## Changes

### `src/pages/ProDashboard.tsx`

1. **Add `Tabs, TabsList, TabsTrigger, TabsContent`** imports from `@/components/ui/tabs`

2. **Split `ProfileSection` into 3 sub-components:**
   - `MyProfileTab` — contact_name, bio, phone, personal photo (new field using `photo_url`), languages, email display
   - `TeamTab` — fetches `professionals` where `agency_id = agent.id` (if agent is agency) or `agent_team_members` for legacy. Shows list with name, role, photo. Owner/admin can remove members. Shows invite placeholder.
   - `CompanyProfileTab` — company_name, tagline, description, logo upload, cover photo upload, office_address, website, social links (instagram, facebook, linkedin). Read-only badge shown for non-admin team members.

3. **Wrap in Tabs component** inside `ProfileSection`:
   ```
   <Tabs defaultValue="personal">
     <TabsList>
       <TabsTrigger value="personal">My Profile</TabsTrigger>
       <TabsTrigger value="team">Team</TabsTrigger>
       <TabsTrigger value="company">Company</TabsTrigger>
     </TabsList>
     <TabsContent value="personal"><MyProfileTab /></TabsContent>
     <TabsContent value="team"><TeamTab /></TabsContent>
     <TabsContent value="company"><CompanyProfileTab /></TabsContent>
   </Tabs>
   ```

4. **Determine editability**: 
   - `const isAdmin = !agent.agency_id || agent.agency_role === 'owner' || agent.agency_role === 'admin'`
   - Pass `isAdmin` to CompanyProfileTab and TeamTab
   - Non-admins see company/team info but inputs are disabled with a "Contact your agency admin to make changes" note

5. **Team tab data**: For agencies, query `professionals` table where `agency_id = agent.id`. For solo agents or team members, query `agent_team_members` by professional_id.

6. **Add `photo_url` to Professional interface** for personal agent photo (column already exists in DB)

### No database changes needed
All columns (`agency_id`, `agency_role`, `photo_url`, `cover_photo_url`) already exist.

## Files Modified
- `src/pages/ProDashboard.tsx` — restructure ProfileSection into tabbed layout with role-based access

