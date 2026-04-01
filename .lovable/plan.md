

# Show Agency Owner in Team List

## Problem
When you're an agency owner, the Team tab queries `professionals WHERE agency_id = agent.id` — but the owner's own record doesn't have `agency_id` pointing to itself (it IS the agency). So the owner never appears in the team list.

## Solution
After loading team members linked via `agency_id`, prepend the agency owner (the current agent) to the team list so they always appear first as "Owner".

## Changes in `src/pages/ProDashboard.tsx`

In `TeamTab.loadTeam()`, after the query for `agent.type === "agency"`:
- Create an owner entry from the `agent` prop with `agency_role: 'owner'`
- Prepend it to the fetched team members array

```typescript
if (agent.type === "agency") {
  const { data } = await supabase
    .from("professionals")
    .select("id, contact_name, email, phone, photo_url, agency_role, slug, languages, avg_rating, total_reviews")
    .eq("agency_id", agent.id)
    .order("agency_role");
  
  // Include the agency owner (self) at the top
  const ownerEntry = {
    id: agent.id,
    contact_name: agent.contact_name,
    email: agent.email,
    phone: agent.phone,
    photo_url: agent.photo_url,
    agency_role: "owner",
    slug: agent.slug,
    languages: agent.languages,
    avg_rating: agent.avg_rating,
    total_reviews: agent.total_reviews,
  };
  setTeamMembers([ownerEntry, ...(data || [])]);
}
```

Also update `handleRemoveMember` to prevent removing yourself (the owner).

## Files Modified
- `src/pages/ProDashboard.tsx` — prepend owner to team list, prevent self-removal

