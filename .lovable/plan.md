

# Expand ProDashboard — Add Zones, Reviews, Settings Sections

## What This Does

Adds 3 new sections to the agent dashboard (My Zones, Reviews, Settings) and updates the navigation to match the requested structure with 3 groups (Main, Business, Account).

## Changes

### 1. Update Section type and navGroups

Expand `type Section` to include `"zones" | "reviews" | "settings"`. Update `navGroups` to add Zones and Reviews under Business, and Settings under Account. Analytics label changes to "Performance".

### 2. New ZonesSection component

Fetches the agent's active zones from `professional_zones` joined with `zones` table. Displays:
- Active zones as cards showing zone name, tier badge, leads this month (counted from `agent_contact_requests`)
- Empty state with terracotta CTA
- Available zones grid fetched from `zones` table (excluding already-claimed zones), each with an "Add" button (mailto for now, since zone purchasing isn't wired up yet)

Data flow: `professional_zones` (where `professional_id = agent.id` and `is_active = true`) joined with `zones` for names.

### 3. New ReviewsSection component

Fetches from `agent_reviews` where `professional_id = agent.id`. Displays:
- Summary card: average rating, total count, star distribution bar
- List of reviews with reviewer name, role badge, rating stars, comment, date
- Empty state if no reviews

### 4. New SettingsSection component

Simple settings page with:
- Email notification preferences (placeholder toggles using Switch component)
- Danger zone: "Delete my profile" button (shows confirmation, doesn't implement actual deletion yet)
- Link to public profile

### 5. Wire sections into content renderer

Add the 3 new section conditionals in the `content` JSX block (lines 821-841) and load zone/review data in `checkAuthAndLoad`.

### 6. Load additional data on mount

In `checkAuthAndLoad`, add parallel fetches for:
- `professional_zones` + `zones` (for ZonesSection)
- `agent_reviews` (for ReviewsSection)
- All `zones` (for available zones list)

Store in new state variables.

## Technical Details

- All new sections follow existing patterns: `font-serif` headings, Card-based layouts, terracotta accents
- Zone data comes from existing `professional_zones` and `zones` tables — no schema changes needed
- Reviews data comes from existing `agent_reviews` table — no schema changes needed
- Components stay inline in ProDashboard.tsx to match the existing pattern (all sections are defined in the same file)

## Files Modified

- `src/pages/ProDashboard.tsx` — expand Section type, update navGroups, add 3 section components, wire data loading and rendering

