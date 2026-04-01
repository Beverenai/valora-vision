

## Plan: Fix Password Reset Flow

### Problem
The reset password page shows "Invalid or expired reset link" immediately because it checks `window.location.hash` for `type=recovery` on mount. Modern auth uses PKCE flow, which sends a `code` query parameter instead of hash fragments. The `onAuthStateChange` event fires `PASSWORD_RECOVERY` but only after the initial render — by then the "invalid link" message is already shown.

### Fix in `src/pages/ResetPassword.tsx`

1. **Add a `isLoading` initial state** (`true`) to avoid showing the "invalid" message before the auth state is determined
2. **Check for `code` query parameter** in addition to the hash fragment — PKCE flow uses `?code=...`
3. **Add a timeout** (3-4 seconds) so if neither hash nor auth event fires, then show the "invalid" message
4. **Keep `onAuthStateChange`** listener for `PASSWORD_RECOVERY` event as fallback

The key change: instead of immediately rendering "Invalid or expired" when `isRecovery` is false, show a loading spinner while waiting for the auth system to process the recovery token. Set `isRecovery = true` if hash contains `type=recovery` OR if URL has a `code` param OR if `PASSWORD_RECOVERY` event fires.

### Files
| Action | File |
|--------|------|
| Modified | `src/pages/ResetPassword.tsx` — add loading state, PKCE code detection, timeout |

