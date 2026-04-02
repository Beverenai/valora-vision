

# Standardize Team Member Cards

## Changes to `src/pages/AgentProfile.tsx` (lines 613–691)

Redesign each team member card to have a fixed-height layout with consistent structure regardless of content:

1. **Fixed card layout** — Replace the horizontal `flex items-start` layout with a vertical centered layout using fixed height (`h-[220px]` or similar) so all cards match.

2. **Content: Picture → Name/Title → Button only** — Remove variable-height content (bio, email/phone, languages, sales badge, star ratings) from the card. Keep only:
   - Photo/avatar (centered, larger ~16x16)
   - Name (single line, truncated)
   - Role/title (single line, truncated)
   - "View Profile" button (links to member profile) instead of "Contact" button

3. **Button behavior** — If member has a `slug`, the button navigates to `/agentes/${professional.slug}/${member.slug}`. If no slug, button is disabled or hidden. Remove the outer `<Link>` wrapper since the button itself handles navigation.

## File

| File | Change |
|------|--------|
| `src/pages/AgentProfile.tsx` | Rewrite team card markup (lines ~613–691): vertical layout, fixed height, photo + name + role + "View Profile" button only |

