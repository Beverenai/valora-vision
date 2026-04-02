

# Buy-Analysis Timeout Fallback Strategy

## Problem
The function times out (Supabase 60s limit) because two sequential JS-rendered ScrapingBee requests exceed the budget.

## Changes to `supabase/functions/buy-analysis/index.ts`

### 1. Global deadline tracking
Add `const DEADLINE = Date.now() + 55_000` at the start of the handler. Before each major step, check `if (Date.now() > DEADLINE)` and return a partial response.

### 2. Detail scrape: fast-first fallback (Step 2)
- **First attempt**: `renderJs: false`, `premiumProxy: true`, `stealthProxy: true`, `countryCode: "es"` with `AbortSignal.timeout(25_000)`
- Parse result with `parsePropertyDetail()`. If valid (has `price` and `sizeM2`), proceed.
- **If null/invalid**: retry with `renderJs: true`, `stealthProxy: true`, `wait: 1000`, same 25s timeout.
- If both fail, return 502/422.

### 3. Comparables search (Step 4)
- Use `renderJs: true`, `stealthProxy: true`, `premiumProxy: true`, `countryCode: "es"`, `wait: 1000` with `AbortSignal.timeout(25_000)`.
- Before starting, check deadline. If close to expiry, return property data with `analysis: null` and timeout message.

### 4. Per-request timeout
Change from relying on the client's internal 120s timeout to passing explicit `AbortSignal.timeout(25_000)` — this requires updating the `fetchWithScrapingBee` call in `scrapingbee-client.ts` to accept an optional `signal` parameter override, OR simply wrapping each call with `Promise.race` against a 25s timer.

**Approach**: Use `Promise.race` pattern in `buy-analysis/index.ts` itself (no shared file changes needed):
```
const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
]);
```

### 5. Timeout guard before comparables search
After detail scrape completes, check remaining time. If `Date.now() + 28_000 > DEADLINE` (not enough time for search), return partial response with property data only.

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/buy-analysis/index.ts` | Add deadline, fast-first detail scrape, 25s per-request timeout, deadline check before comparables |

No shared file changes. Will test with `{ "url": "https://www.idealista.com/inmueble/106583498/" }` after deploy.

