

## Plan: Fix Build Error + Redesign Result Pages with Structural Grid Aesthetic

### Problem 1: Build Error
The `PropertySummaryCard.tsx` file exists but Vite can't resolve it. This is a persistent build cache issue. The fix is to re-save all 8 result component files to force the build system to recognize them.

### Problem 2: Design Refresh
The uploaded reference (`react-app_8.js`) showcases a distinctive **structural grid** design language:
- **1px border grids** between panels (not rounded cards with shadows)
- **Clean, editorial typography** — large light-weight numbers, uppercase tracking labels
- **Dark navy + white panel contrast** with gold accent lines
- **Data-forward layout** — big numbers, minimal decoration
- **Image cells** with overlay boxes and blur effects

This is a significant departure from the current rounded-card approach. The plan is to **adapt the feeling** (structural grids, accent lines, editorial type, data density) while keeping our Tailwind/Shadcn system.

### Changes

#### 1. Fix build: Re-create all result components
Re-write each file in `src/components/result/` to force Vite to pick them up, while simultaneously applying the new design language.

#### 2. Redesign `ValuationHero.tsx`
- Replace gradient blob with a **structural two-panel layout**: dark navy left panel with address + heading, right panel as image cell with placeholder (gray bg with house icon overlay box)
- Gold accent line at top of hero
- Uppercase tracking labels ("Estimated Value Report")
- Share/Download buttons as clean outline style

#### 3. Redesign `PropertySummaryCard.tsx`
- Replace rounded card with a **1px border grid** of data cells
- Each property detail in its own panel cell (like the stats section in reference)
- Large light-weight values, tiny uppercase labels above
- Property type shown as accent-line-topped cell

#### 4. Redesign `ValuationResultCard.tsx`
- Left column: dark navy/blue gradient panel with huge price range (font-weight 300, large size)
- Right column: grid of smaller panels for rental estimates + confidence score
- Accent line separators, editorial number formatting

#### 5. Redesign `AIAnalysisSection.tsx` & `MarketTrendsSection.tsx`
- Clean white panels with 1px borders
- Uppercase section labels
- Chart placeholder with teal gradient line (matching reference)

#### 6. Redesign `ProfessionalSpotlight.tsx`
- Agent displayed in structural grid with avatar square, gold accent line for premium
- Contact button in outline style
- Gold "Premium Partner" label

#### 7. Add placeholder house images
- Use gray background cells with subtle gradient overlays as image placeholders
- Add overlay boxes with property-type text (like the reference "Market Intelligence" overlay)
- These act as slots for real images later

#### 8. Update `SellResult.tsx` and `RentResult.tsx`
- Replace the `space-y-6` stacked layout with the structural grid approach
- Sections separated by 1px borders, not margin gaps
- Wrap in max-width 1400px container

### Design Tokens to Apply
- `border: 1px solid #CBD5E1` between grid cells (use Tailwind `border-border`)
- Uppercase labels: `text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground`
- Large data numbers: `text-5xl font-light tracking-tight`
- Gold accent lines: `h-0.5 bg-[hsl(var(--gold))]` at top of premium elements
- Panel padding: `p-6` (md) or `p-12` (lg hero)
- Image cells: `bg-slate-300 min-h-[300px] relative` with overlay

### Files to Create/Modify
- `src/components/result/ValuationHero.tsx` — rewrite
- `src/components/result/PropertySummaryCard.tsx` — rewrite
- `src/components/result/ValuationResultCard.tsx` — rewrite
- `src/components/result/AIAnalysisSection.tsx` — rewrite
- `src/components/result/MarketTrendsSection.tsx` — rewrite
- `src/components/result/ProfessionalSpotlight.tsx` — rewrite
- `src/components/result/FeedbackSection.tsx` — rewrite
- `src/components/result/ValuationDisclaimer.tsx` — rewrite
- `src/pages/SellResult.tsx` — update layout structure

