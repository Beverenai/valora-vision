

## Plan: Performance Optimization — Lazy Loading + Chunk Retry

### Summary
Add a `lazyRetry` utility for resilient chunk loading, convert all non-critical pages to lazy imports in App.tsx, and extract SellResult.tsx inline sections into separate components for grouped lazy loading.

---

### 1. Create `lazyRetry` utility

**New file: `src/lib/lazyRetry.ts`**

Single-retry wrapper around dynamic imports. On chunk-load failure (stale deploy), does one hard reload using `sessionStorage` to prevent infinite loops. Exactly as specified in the prompt.

---

### 2. Lazy-load pages in `src/App.tsx`

Convert all page imports (except `Index` and `NotFound` which are critical-path) to `React.lazy` + `lazyRetry`. Wrap `<Routes>` in `<Suspense fallback={<LoadingSpinner />}>`.

**Pages to lazy-load** (13 total):
- SellValuation, RentValuation, SellResult, RentResult
- BuyAnalysis, BuyResult, ValuationLookup
- Admin, AgentProfile, AgentDirectory
- ProLanding, ProOnboard, ProOnboardSuccess, ProLogin, ProDashboard, ResetPassword

---

### 3. Extract SellResult sections into components

SellResult.tsx (1007 lines) has everything inlined. To enable grouped lazy loading, extract into:

**New files:**
- `src/components/result/PropertyFeaturesSection.tsx` — feature icons grid (lines ~29-100)
- `src/components/result/ComparablePropertiesSection.tsx` — comparable cards + similarity logic (lines ~100-350)
- `src/components/result/AreaComparisonSection.tsx` — area price comparison (lines ~350-430)
- `src/components/result/MarketTrendsSection.tsx` — Recharts area chart (lines ~430-505)
- `src/components/result/MatchedAgentsSection.tsx` — agent cards + contact modal (lines ~505-750)
- `src/components/result/ValuationPredictionGame.tsx` — guess-the-price game (lines ~750-830)
- `src/components/result/ValuationDisclaimer.tsx` — disclaimer text (lines ~830-835)
- `src/components/result/RefCodeBadge.tsx` — reference code copy badge (reused in RentResult too)

Each component receives its data as props from the parent SellResult page.

---

### 4. Grouped lazy loading in SellResult.tsx

After extraction, group the lazy imports:

- **Group 1 (eager)**: ValuationTicketCard, CardRevealWrapper, RefCodeBadge — above the fold
- **Group 2 (lazy)**: PropertyFeaturesSection + ComparablePropertiesSection + AreaComparisonSection + MarketTrendsSection — bundled as one chunk via `Promise.all`
- **Group 3 (lazy)**: MatchedAgentsSection + ValuationPredictionGame + ValuationDisclaimer — loads last

Each group wrapped in `<Suspense>` with a minimal skeleton fallback.

---

### 5. Suspense fallback component

**New file: `src/components/shared/PageLoadingFallback.tsx`**

Simple centered spinner/pulse animation used as the Suspense fallback in App.tsx and result pages. Consistent with existing loading states.

---

### Files

| Action | File |
|--------|------|
| New | `src/lib/lazyRetry.ts` |
| New | `src/components/shared/PageLoadingFallback.tsx` |
| New | `src/components/result/PropertyFeaturesSection.tsx` |
| New | `src/components/result/ComparablePropertiesSection.tsx` |
| New | `src/components/result/AreaComparisonSection.tsx` |
| New | `src/components/result/MarketTrendsSection.tsx` |
| New | `src/components/result/MatchedAgentsSection.tsx` |
| New | `src/components/result/ValuationPredictionGame.tsx` |
| New | `src/components/result/ValuationDisclaimer.tsx` |
| New | `src/components/result/RefCodeBadge.tsx` |
| Modified | `src/App.tsx` — lazy imports + Suspense |
| Modified | `src/pages/SellResult.tsx` — import extracted components, grouped lazy loading |

