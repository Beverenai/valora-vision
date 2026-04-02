

# Fix Team Member Count + Improve Address Geocoding

## Two Issues

### 1. Team member count shows wrong number

**Root cause**: The agent profile page displays `professional.team_size` — a static column set once during onboarding. For "La Sala homes", this was set to `1` during signup, but the actual `agent_team_members` table has `2` active members.

**Fix**: In `AgentProfile.tsx`, replace `professional.team_size` with the actual count of loaded team members (`teamMembers.length`). Also pluralize correctly: "1 member" vs "2 members".

**File**: `src/pages/AgentProfile.tsx` (line ~524-528)
- Replace `professional.team_size` with `teamMembers.length`
- Use `teamMembers.length === 1 ? "member" : "members"` for proper pluralization
- Only show the badge when `teamMembers.length > 0`

### 2. Geocode address from Idealista links for accurate map pins

**Root cause**: The enrich function asks Firecrawl to extract `latitude`/`longitude` directly, but Idealista pages rarely expose raw coordinates. So most enriched sales end up with no coordinates and don't appear on the map.

**Fix**: After Firecrawl extraction, if coordinates are missing but an address/city was found, use a **geocoding fallback** (Google Geocoding API or Mapbox Geocoding API) to convert the address string into precise lat/lng.

**File**: `supabase/functions/enrich-sale-listing/index.ts`
- After extracting data from Firecrawl, check if `latitude`/`longitude` are missing but `address` + `city` exist
- Call the Mapbox Geocoding API (already have `VITE_MAPBOX_TOKEN` — will need it as a server-side secret `MAPBOX_TOKEN`) to geocode: `https://api.mapbox.com/geocoding/v5/mapbox.places/{address},{city},Spain.json?access_token=...`
- Parse the first result's `center` coordinates `[lng, lat]`
- Set `update.latitude` and `update.longitude` from the geocode result
- This ensures every enriched sale with an address gets a map pin

**Secret needed**: `MAPBOX_TOKEN` (same value as the frontend `VITE_MAPBOX_TOKEN`, but available server-side in the edge function)

## Files to change

| File | Change |
|------|--------|
| `src/pages/AgentProfile.tsx` | Use `teamMembers.length` instead of `professional.team_size`; fix pluralization |
| `supabase/functions/enrich-sale-listing/index.ts` | Add Mapbox geocoding fallback when Firecrawl doesn't return coordinates |

