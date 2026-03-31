

## Plan: Fix Agent Profile "Not Found" Error

### Root Cause
The `professionals` table is **empty** — the `publish-agent-profile` edge function either wasn't deployed or is failing silently. The function code itself is correct, so the fix involves:

1. **Deploying the edge function** (it was created but may not have been deployed)
2. **Hardening the error handling** on the client side so failures are visible
3. **Making the profile page more resilient** with case-insensitive slug matching and better fallback UI

### Changes

**1. Deploy `publish-agent-profile` edge function**
- Use the deploy tool to ensure it's live

**2. `src/pages/ProOnboard.tsx` — Better error logging**
- Add `console.log` after the edge function call to log the full response
- Log the generated slug before calling the function
- Ensure the response body is checked properly (edge function returns `{ error: ... }` on failure with status 500, but `supabase.functions.invoke` doesn't throw on non-2xx — it returns the parsed body in `data`)

**3. `src/pages/AgentProfile.tsx` — Case-insensitive slug + better fallback**
- Change `.eq("slug", slug)` to `.ilike("slug", slug)` for case-insensitive matching
- Replace the bare "Agent not found" with a styled empty state showing a message and link back to the homepage

**4. `supabase/functions/publish-agent-profile/index.ts` — Add more detailed error logging**
- Log the incoming payload (sans password) for debugging
- Log success with the created professional ID

### Files Modified
- `src/pages/ProOnboard.tsx` — add debug logging + better error handling
- `src/pages/AgentProfile.tsx` — case-insensitive slug query + improved not-found UI
- `supabase/functions/publish-agent-profile/index.ts` — add request/success logging

### Deploy
- Deploy `publish-agent-profile` edge function

