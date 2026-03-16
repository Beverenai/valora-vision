

## Plan: Card-Driven Valuation Flow — End to End

### Vision
The ValuationTicketCard is the **single signature element** that transforms through every stage of the user journey: input → form → processing → result. Each transition is a visual evolution of the same card, not a page change.

### Flow Overview

```text
STAGE 1: HERO INPUT          STAGE 2: FORM              STAGE 3: PROCESSING         STAGE 4: RESULT
┌─────────────┐             ┌─────────────┐            ┌─────────────┐             ┌─────────────┐
│  [Image]    │             │ [Compact]   │            │  [Image]    │             │  [Image]    │
│             │             │ 📍 Calle... │            │             │             │  €1,250,000 │
│  Your       │             ├─────────────┤            │  ANALYSING  │             │   VALUED    │
│  Valuation  │             │             │            │             │             │  REF #A1B2  │
│             │             │  Step 2/4   │            │  ████░░ 62% │             │  ▐▐▐▐▐▐▐▐  │
│  📍 ______  │  ──────►    │  Bedrooms   │  ──────►   │             │  ──────►    ├─────────────┤
│  Continue → │             │  Bathrooms  │            │  Analysing  │             │ Property    │
│  ▐▐▐▐▐▐▐▐  │             │  Size...    │            │  market...  │             │ Details     │
└─────────────┘             │             │            │  ▐▐▐▐▐▐▐▐  │             ├─────────────┤
                            │  [Back|Next]│            └─────────────┘             │ Market Data │
                            └─────────────┘                                       │ Analysis    │
                                                                                  │ Agent CTA   │
                                                                                  └─────────────┘
```

### Changes by File

**1. `src/components/ValuationTicketCard.tsx` — Add "processing" mode**
- New prop: `mode?: "input" | "compact" | "result" | "processing"`
- Processing mode replaces the summary text area with:
  - Headline changes to "ANALYSING" (animated pulse)
  - A progress bar replaces the summary paragraph
  - Rotating status text below ("Researching property data..." → "Analyzing market..." → "Calculating...")
  - The barcode and ref code remain visible throughout
- This replaces the current `LoadingOverlay` portal — loading happens **inside the card itself**
- The card's image shifts from grayscale to color as progress reaches 100%

**2. `src/pages/SellValuation.tsx` — Unified card-driven flow**
- Remove the separate `LoadingOverlay` import
- The page has 3 visual states driven by the card:
  - **State A (not expanded)**: Full card in input mode (as now)
  - **State B (expanded)**: Compact card anchored at top + form steps below (as now, but tighter)
  - **State C (submitting)**: Full card in "processing" mode — form disappears, card expands back to full size with progress animation
- After processing completes → navigate to result page
- **Reference code**: Generate a short human-readable ref code (e.g., `VC-A1B2C3`) from the lead UUID and display it on the card during processing. This same code appears on the result page.

**3. `src/pages/RentValuation.tsx` — Same pattern as Sell**
- Mirror the same card-driven flow: input → compact+form → processing card → result
- Remove `LoadingOverlay` usage
- Use `accentType="rent"` throughout

**4. `src/pages/SellResult.tsx` — Card as hero, detail page below**
- Keep the existing `ValuationTicketCard` at the top (already there)
- Add the **reference code** prominently — displayed both on the card and as a copyable badge below it
- The ref code is derived from the lead `id` (first 8 chars formatted as `VC-XXXX-XXXX`)
- Add a "Return to this valuation anytime" note with the ref code
- Below the card: all existing detail sections remain (PropertySummaryCard, ValuationResultCard, AIAnalysis, MarketTrends, etc.)
- No structural changes to the detail sections — they already follow the editorial spatial system

**5. `src/pages/RentResult.tsx` — Same ref code pattern**
- Add reference code display matching SellResult

**6. `src/components/shared/LoadingOverlay.tsx` — Keep but deprecate**
- Keep the file for now (no breaking changes), but it's no longer imported by the valuation pages
- The card's processing mode replaces it

**7. Reference code utility — `src/utils/referenceCode.ts` (new file)**
- `formatRefCode(uuid: string): string` → takes a UUID, returns `VC-A1B2-C3D4`
- Used on the card, result pages, and eventually for lookup

### Reference Code System
- The ref code is a **formatted view** of the existing lead UUID (not a new DB column needed yet)
- Format: `VC-` prefix + first 8 hex chars of the UUID split into two groups: `VC-A1B2-C3D4`
- Displayed on the card barcode area, the result page hero, and as a copyable element
- Future: add a `/valuation/:refCode` lookup route (not in this phase)

### What stays unchanged
- All form step components (SellLocationStep, SellDetailsStep, etc.)
- All result detail components (PropertySummaryCard, AIAnalysis, etc.)
- The Index.tsx landing page
- Database schema (ref code derived from existing UUID)
- The card's visual brand (colors, barcode, image, typography)

### Implementation order
1. Create `referenceCode.ts` utility
2. Add "processing" mode to `ValuationTicketCard`
3. Update `SellValuation.tsx` to use card-driven processing
4. Update `SellResult.tsx` with ref code display
5. Mirror changes to `RentValuation.tsx` and `RentResult.tsx`

