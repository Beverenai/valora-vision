

## Why Google Maps Shows "Not Configured"

The `VITE_GOOGLE_MAPS_API_KEY` is stored as a backend secret, but Vite frontend environment variables need to be available at build time — they get baked into the JavaScript bundle. Backend secrets are only accessible from edge functions, not from `import.meta.env` in the browser.

### Fix

Since Google Maps API keys are **public/publishable** keys (they're exposed in every browser request anyway, and should be restricted via Google Cloud Console domain restrictions instead), the key should be stored directly in the codebase rather than as a secret.

**Option A — Hardcode in the component** (simplest):
- Add the Google Maps API key directly in `GoogleAddressInput.tsx` or a config file
- This is safe because Maps API keys are always visible in browser network requests regardless

**Option B — Add to `.env` as a build-time variable**:
- However, Lovable auto-manages `.env` so we can't edit it directly

### Recommended approach

1. Create a config file `src/config/google-maps.ts` exporting the API key
2. Update `GoogleAddressInput.tsx` to import from that config instead of `import.meta.env`
3. You'll need to provide me the actual API key value so I can embed it

### Alternative

If you'd prefer not to expose the key in code, we could proxy Google Maps requests through a backend function — but this adds complexity and latency for no real security gain (Maps keys are inherently public).

**I'll need you to share the Google Maps API key value** so I can add it to the config file, since I can't read the encrypted secret value.

