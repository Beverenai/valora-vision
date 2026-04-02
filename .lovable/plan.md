

# Cover Photo Focal Point Picker

## Problem
When a team cover photo is cropped (e.g., from a wide landscape to a narrow banner), `object-cover` centers the crop by default — often cutting off faces at the top or bottom.

## Solution
Add a clickable focal point selector on the cover photo preview in the Company Profile section. The agent clicks where the important content is (e.g., faces), and we store that position as `cover_photo_focus_x` and `cover_photo_focus_y` (0-100 percentages). Both the dashboard preview and the public AgentProfile page use `object-position` with these values.

## How It Works
1. After uploading a cover photo, the preview becomes clickable
2. A small crosshair dot appears where the agent clicks
3. The x/y percentage is saved to the `professionals` table
4. The public profile uses `object-position: {x}% {y}%` instead of default `center`

## Changes

### Database Migration
- Add two columns to `professionals`: `cover_photo_focus_x SMALLINT DEFAULT 50` and `cover_photo_focus_y SMALLINT DEFAULT 50`

### ProDashboard.tsx — Company Profile Section
- Add state for `focusX` / `focusY` (default 50/50)
- Make the cover photo preview clickable — on click, compute % position relative to image bounds
- Show a small dot overlay at the focal point
- Apply `object-position: {focusX}% {focusY}%` to the preview
- Save focus values alongside cover photo URL on handleSave
- Add helper text: "Click on the photo to set the focus point"

### AgentProfile.tsx — Hero Banner
- Read `cover_photo_focus_x` and `cover_photo_focus_y` from the professional record
- Apply as `background-position: {x}% {y}%` on the hero div (which uses `background: url(...) center/cover`)

### Files Modified
- `supabase/migrations/` — add 2 columns
- `src/pages/ProDashboard.tsx` — focal point picker UI + save logic
- `src/pages/AgentProfile.tsx` — use focal point in hero background-position

