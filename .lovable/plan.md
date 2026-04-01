

## Plan: Make Agent Onboarding Robust End-to-End

### Problem

The onboarding flow breaks at publish time because:
1. `signUp` for an already-registered email returns a fake `user_id` that doesn't exist in `auth.users` — the edge function then fails with an FK constraint violation
2. No recovery path exists — the user is stuck with no way to retry or link to their existing account
3. The edge function has no idempotency — if publish is retried it could create duplicate rows

### Changes

**A. Edge function: `supabase/functions/publish-agent-profile/index.ts`**

Make the function defensive and idempotent:

1. Before inserting into `professionals`, check if a row with this `user_id` already exists. If so, update it instead of inserting (upsert pattern)
2. Before inserting into `user_roles`, check if the role already exists to avoid duplicate key errors
3. Before inserting team members, delete existing ones for this professional (idempotent retry)
4. Add explicit error handling for FK violations with a clear error message: "User account not found — please sign up again"

**B. Client: `src/pages/ProOnboard.tsx` — `handlePublish`**

Fix the signup → publish sequence:

1. After `signUp`, check `identities` array — if empty, the email is already registered
2. When account already exists, offer two paths:
   - Try to `signInWithPassword` with the provided email + password
   - If sign-in succeeds, use that session's `user.id` and proceed to publish
   - If sign-in fails (wrong password), show a clear message: "This email is already registered. Please use the correct password or sign in at /pro/login"
3. This means an agent who failed mid-onboard can retry without creating a new email

**C. Client: improve error recovery**

1. Catch the specific FK/constraint errors from the edge function and show actionable messages instead of raw error strings
2. Don't reset `isSubmitting` inside the success path — only in `finally`

### Technical detail

```text
handlePublish flow:
  1. signUp(email, password)
  2. if identities empty → signIn(email, password)
     → success: use session user_id, continue
     → fail: toast "wrong password or sign in at /pro/login", return
  3. invoke publish-agent-profile with valid user_id
  4. navigate to success page

Edge function flow:
  1. Validate required fields
  2. Check if professional exists for user_id
     → exists: UPDATE instead of INSERT
  3. Delete + re-insert team members
  4. Upsert user_roles (INSERT ... ON CONFLICT DO NOTHING equivalent)
  5. Return { success, slug }
```

### Files

| Action | File |
|--------|------|
| Modified | `supabase/functions/publish-agent-profile/index.ts` — add upsert logic, idempotency |
| Modified | `src/pages/ProOnboard.tsx` — handle existing accounts via signIn fallback, better error messages |

