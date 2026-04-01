

## Plan: Fix Step 1 Validation Blocking Progression

### Problem

Two issues prevent advancing from Step 1 despite all fields being filled:

1. **`emailValid` race condition**: `onChange` (line 407) resets `emailValid = false` on every keystroke. It only becomes `true` after `onBlur` triggers `checkEmailUniqueness` which is async. If the user fills email and moves on without explicitly blurring the email field, or if the async check is slow, `canProceedStep1` stays false.

2. **Login not persisting** (separate issue): After onboarding, `supabase.auth.signUp` creates the user but doesn't automatically log them in if email confirmation is required. When the user later visits `/pro/login`, they need to confirm their email first.

### Fix in `src/pages/ProOnboard.tsx`

**A. Make email validation synchronous for format, async check as bonus**

Change `canProceedStep1` (line 153) to not require `emailValid` — only require no error:
```typescript
const canProceedStep1 = companyName.trim() && contactName.trim() && 
  email.trim() && phone.trim() && address.trim() && 
  !emailError && !emailChecking;
```

Remove `emailValid` from the gate. The uniqueness check still runs on blur and sets `emailError` if duplicate — that's sufficient.

**B. Run email check on Continue click if not yet validated**

In the Continue button handler (line 462), before checking `canProceedStep1`, trigger the email uniqueness check if it hasn't been validated yet. Make the handler async:
```typescript
onClick={async () => {
  // Run email check if not already validated
  if (!emailValid && email.trim()) {
    await checkEmailUniqueness(email);
  }
  if (canProceedStep1) setStep(1);
  else toast({ ... });
}}
```

**C. Fix `onChange` not clearing `emailValid` too aggressively**

Line 407: Stop resetting `emailValid = false` on every keystroke. Instead, only invalidate when format changes. Move the `setEmailValid(false)` into `validateEmail` (only when format is invalid).

### Files

| Action | File |
|--------|------|
| Modified | `src/pages/ProOnboard.tsx` — fix validation gate and email check timing |

