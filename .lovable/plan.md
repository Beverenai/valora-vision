
# Add Edit Team Member Dialog for Admins

## What Changes
Add an "Edit" button on each team member card (admin only) that opens a dialog with all editable fields: name, role, email, phone, whatsapp, photo_url, languages. On save, update `agent_team_members` and reload.

## Changes in `src/pages/ProDashboard.tsx`

### 1. Add edit state to TeamTab
- `editingMember` state (the member being edited, or null)
- `editForm` state with all fields: name, role, email, phone, whatsapp, photo_url, languages

### 2. Add Edit Dialog
A `Dialog` component that opens when clicking the Edit button on a member card. Contains:
- Name, Role, Email, Phone, WhatsApp inputs
- Photo URL input
- Languages (comma-separated text input, stored as array)
- Save button that calls `supabase.from("agent_team_members").update({...}).eq("id", member.id)`

### 3. Add Edit button to member cards
- Place a `Pencil`/`Edit2` icon button next to the active toggle and delete button (admin only)
- Owner can also be edited (just not deactivated/removed)

### 4. Import Dialog components
Add `Dialog, DialogContent, DialogHeader, DialogTitle` imports (check if already imported).

## Files Modified
- `src/pages/ProDashboard.tsx` — add edit dialog and button to TeamTab
