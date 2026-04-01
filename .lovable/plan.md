

# Restore Editorial Timeline + Bento Grid Sections (with new colors)

## What Changes
Revert the "How It Works" and "Everything In Your Report" sections back to their previous editorial design — the vertical timeline with large step numbers and connecting line, and the asymmetric bento grid with visual previews — while keeping the new magenta/indigo color palette.

## Changes in `src/pages/Index.tsx`

### 1. How It Works → Vertical Timeline
Replace the current 4-column grid with the previous vertical timeline layout:
- Large step numbers (01, 02, 03) positioned left, with a vertical connecting line
- Each step has an icon circle on the timeline, bold uppercase title, description, and an inline visual preview (address input mock, property pills, etc.)
- Step 3 includes the flippable ValuationTicketCard
- Use `text-primary` for step numbers and icon backgrounds (magenta instead of old terracotta)
- Section heading uses the SectionLabel + large bold heading style
- 3 steps instead of 4 (matching the screenshot: Enter address → Tell us about property → See what you'll receive)

### 2. Everything In Your Report → Bento Grid
Replace the current 3×2 service card grid with the previous asymmetric bento layout:
- 6 feature cards in a visually interesting grid (2-col top row with different sizes, 1-col wide row, 2-col bottom row)
- Each card has: bold uppercase title, description, and a visual preview element (price bar, sqm color blocks, dot rating, trend line, property thumbnails, agent avatars)
- Cards use `border border-[rgba(0,0,0,0.06)] rounded-2xl` with padding
- Visual accents use `bg-primary/20` and `text-primary` (magenta)
- Section heading: "EVERYTHING IN YOUR REPORT" with SectionLabel "Included Free"

### 3. Typography
- Keep `font-bold` for headings (Inter bold, not serif) — matches the new design system
- Step titles: uppercase bold
- All text remains Inter (no serif restoration)

## Files Modified
- `src/pages/Index.tsx` — replace How It Works grid and Service Grid with timeline + bento layouts

