

## Plan: Enforce Minimum 45-60 Second Wait on Valuations

### Problem
Currently, the valuation result navigates as soon as the backend responds. If the API is fast, users see results in seconds, undermining perceived thoroughness.

### Solution
Record `Date.now()` when submission starts. When the API responds, calculate elapsed time. If less than 45 seconds, delay navigation until the minimum is reached. The progress animation already simulates ~60 seconds, so this aligns naturally.

### Changes

**Files: `src/pages/SellValuation.tsx` and `src/pages/RentValuation.tsx`**

Same pattern in both:

1. Record `const startTime = Date.now()` when submission begins
2. After API returns successfully, calculate `const elapsed = Date.now() - startTime`
3. If `elapsed < 45000`, wait `45000 - elapsed` ms before setting progress to 100 and navigating
4. During the wait, the existing progress simulation continues running (it already caps at 90% until manually set to 100)

```typescript
// After successful API response:
const MIN_WAIT_MS = 45000;
const elapsed = Date.now() - startTime;
const remaining = Math.max(0, MIN_WAIT_MS - elapsed);

setTimeout(() => {
  setSubmittedLeadId(leadId);
  setSimulatedProgress(100);
  stopProgressSimulation();
  setTimeout(() => navigate(`/sell/result/${leadId}`), 600);
}, remaining);
```

No backend changes needed. The progress bar already animates toward 90% over ~60 seconds, so the minimum wait keeps the two in sync.

