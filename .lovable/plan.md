

## Plan: Persistent Query Cache + Idle-Time Prefetching

### 1. Install dependency

Add `@tanstack/react-query-persist-client` package (includes `createSyncStoragePersister`).

### 2. Update `src/App.tsx`

**QueryClient config** — Replace the bare `new QueryClient()` (line 30) with configured defaults:
- `gcTime: 24h`, `refetchOnWindowFocus: true`, `refetchOnMount: true`, `retry: 3` with exponential backoff

**Persist provider** — Create a `createSyncStoragePersister` using `localStorage`, then replace `<QueryClientProvider>` with `<PersistQueryClientProvider>`.

**Idle-time prefetching** — Extract `App` to a function component (it already is an arrow). Add a `useEffect` that calls `requestIdleCallback` (with `setTimeout` fallback) to prefetch `SellResult` and `AgentDirectory` chunks after initial render.

### 3. Note on hero image (1.6)

The user's prompt mentions a hero image fix for `/vender` but the instruction is incomplete (truncated). Skipping this — can be addressed in a follow-up.

### Files Modified
- `src/App.tsx` — persistent cache provider, query defaults, idle prefetching

