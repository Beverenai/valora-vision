

## Plan: Remove AI references + Add soft section dividers

### 1. Remove all "AI" mentions

Locations to update in `src/pages/Index.tsx`:

- **Line 48**: Step 03 desc "Receive an AI-powered market estimate in seconds." → "Receive a market estimate based on real data in seconds."
- **Line 60**: Feature desc "AI-calculated price based on comparable sales data." → "Calculated price based on comparable sales data."
- **Line 82**: Feature title "AI Property Analysis" → "Property Analysis"
- **Line 135**: Testimonial "The AI valuation was within 3% of the final sale price." → "The valuation was within 3% of the final sale price."
- **Line 249**: Hero badge "Free AI-powered valuation" → "Free property valuation"

### 2. Add soft section dividers

Inspired by the reference image (Immediate app), use alternating warm tinted backgrounds with subtle top borders to create gentle visual separation without hard lines:

- Current approach already alternates `bg-[#FAFAF7]` and `bg-white` — this is good but too subtle
- Add a very light warm tint variation: introduce `bg-[#F5F3EE]` (slightly warmer/darker off-white) as a third tone for select sections (How It Works, Recent Valuations)
- Add `border-t border-[#E8E5E0]` (1px warm gray) to each section transition for a gentle structural line
- This creates a rhythm: white → warm border → slightly tinted → warm border → white, making sections distinct without being jarring

Sections mapping:
- Hero: `bg-[#FAFAF7]` (no border, first section)
- Trusted By: `bg-white` + `border-t border-[#E8E5E0]`
- How It Works: `bg-[#F5F3EE]` + `border-t border-[#E8E5E0]`
- Report Features: `bg-white` + `border-t border-[#E8E5E0]`
- Recent Valuations: `bg-[#F5F3EE]` + `border-t border-[#E8E5E0]`
- Testimonials: `bg-white` + `border-t border-[#E8E5E0]`
- Final CTA: gradient stays as-is + `border-t border-[#E8E5E0]`

All changes in `src/pages/Index.tsx` only.

