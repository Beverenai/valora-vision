

## Plan: Design Improvements — SectionLabel, Serif Subtitles, Breakpoints, Visual Hierarchy

### 1. Create `SectionLabel` component

**New file: `src/components/ui/SectionLabel.tsx`**

Reusable uppercase label with `text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium mb-3`. Uses `cn()` for className merging.

### 2. Add extended breakpoints to Tailwind

**Modified: `tailwind.config.ts`**

Add `xs: '400px'` and `tablet: '900px'` to `theme.extend.screens` (keeping default sm/md/lg/xl/2xl intact).

### 3. Replace inline section labels across result components

**Modified: `src/components/ResultAnalysisGroup.tsx`**
- Import `SectionLabel` from `@/components/ui/SectionLabel`
- Replace all inline `<p className="text-[0.65rem] uppercase tracking-[0.15em]...">` patterns with `<SectionLabel>`
- Sections: PropertyFeaturesSection, ComparablePropertiesSection, AreaComparisonSection, MarketTrendsSection

**Modified: `src/components/ResultAgentGroup.tsx`**
- Same replacement for MatchedAgentsSection and ValuationPredictionGame labels

### 4. Replace inline section label in Index.tsx

**Modified: `src/pages/Index.tsx`**
- Replace the local `SectionLabel` component (lines 59-63) with import from `@/components/ui/SectionLabel`
- Add italic serif subtitle under the hero heading: `<p className="font-serif italic text-muted-foreground text-base sm:text-lg mt-2">`
- Use new breakpoints for hero heading: `text-2xl xs:text-3xl sm:text-4xl tablet:text-5xl lg:text-6xl`

### 5. Add section visual hierarchy on result pages

**Modified: `src/components/ResultAnalysisGroup.tsx`** and **`src/components/ResultAgentGroup.tsx`**
- Each section gets `border-b border-border/50` bottom border
- Add serif `<h2>` headings under the SectionLabel where appropriate (e.g. "Estimated Value", "Comparable Properties", "Area Comparison", "Market Trends")

### Files

| Action | File |
|--------|------|
| New | `src/components/ui/SectionLabel.tsx` |
| Modified | `tailwind.config.ts` |
| Modified | `src/components/ResultAnalysisGroup.tsx` |
| Modified | `src/components/ResultAgentGroup.tsx` |
| Modified | `src/pages/Index.tsx` |

