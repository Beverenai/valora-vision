

# Hero/Cover Image for Agent Profiles

## What This Does
Lets agents upload a hero/cover image for their profile page. The AI onboarding tries to extract an image from Firecrawl (e.g. og:image), but agents can upload their own in both onboarding Step 3 and the Dashboard Profile section. The `cover_photo_url` column already exists on `professionals`.

## Changes

### 1. Onboard Edge Function — Extract cover photo from Firecrawl
In `supabase/functions/onboard-agency/index.ts`, the `cover_photo_url` is already initialized to `null` (line 37). Add logic to set it from Firecrawl metadata — use `ogImage` or a large image from the scraped content as the cover photo candidate (separate from logo). Return `cover_photo_url` in the response.

### 2. ProOnboard.tsx — Add cover photo state + UI in Step 3
- Add `coverPhotoUrl` state (populated from AI scan result)
- In Step 3 review UI (after the Logo section, ~line 636), add a "Cover Photo" section with:
  - Preview of current cover image (or a gradient placeholder)
  - Upload button using `<input type="file">` with `URL.createObjectURL` for preview
  - Helper text: "This appears as the hero banner on your profile"
- Pass `cover_photo_url` to `publish-agent-profile` edge function

### 3. Publish Edge Function — Accept cover_photo_url
In `supabase/functions/publish-agent-profile/index.ts`, add `cover_photo_url` to the destructured request body and include it in `profileData`.

### 4. ProDashboard ProfileSection — Add cover photo upload
In the `ProfileSection` component (~line 448), add a cover photo upload section (after the logo upload):
- Show current cover image preview (wide aspect ratio, ~16:9)
- Upload button using the existing `agent-logos` storage bucket (path: `{agent.id}/cover.{ext}`)
- Save `cover_photo_url` to `professionals` table immediately on upload (same pattern as logo)
- Include in the `handleSave` payload

### 5. Storage bucket
The `agent-logos` bucket already exists and is used for logo uploads. We'll reuse it for cover photos too (different file path).

## Files Modified
- `supabase/functions/onboard-agency/index.ts` — extract cover photo from Firecrawl metadata
- `supabase/functions/publish-agent-profile/index.ts` — accept and save cover_photo_url
- `src/pages/ProOnboard.tsx` — add cover photo state, AI population, upload UI in Step 3
- `src/pages/ProDashboard.tsx` — add cover photo upload to ProfileSection

