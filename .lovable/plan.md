
Fix the button issue at the source instead of only tweaking opacity.

1. Root cause
- The shared `outline` button in `src/components/ui/button.tsx` hardcodes `bg-background`.
- In this app, `bg-background` is white here, so every admin `variant="outline"` button is still white.
- `src/pages/Admin.tsx` then adds white text classes on top, which creates the “white text inside a white button” problem.

2. Implementation
- Add a dedicated dark admin outline variant in `src/components/ui/button.tsx`, for example:
  - `border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white`
- Keep the existing `outline` variant unchanged so light pages do not regress.
- In `src/pages/Admin.tsx`, replace the admin dark-mode outline buttons with:
  - `variant={dark ? "outline-dark" : "outline"}`
- Remove the repeated dark-mode border/text overrides that are currently trying to patch the wrong base style.
- Keep primary buttons like `Enter`, `Save`, and `Sync All` unchanged.

3. What this fixes
This will correct all current broken admin buttons, including:
- Refresh
- Load More
- Scrape
- Add Config
- Cancel
- Sync Now
- Health Refresh

4. Files
- `src/components/ui/button.tsx` — add reusable dark-outline variant
- `src/pages/Admin.tsx` — switch admin outline buttons to the new variant

5. Notes
- I checked the shared button styles and admin page usage: this is a structural variant issue, not just a contrast tweak.
- The problematic pattern is currently in `Admin.tsx`; light-page outline buttons can stay as they are.
- No backend or database changes are needed.
