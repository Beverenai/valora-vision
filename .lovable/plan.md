

## Plan: Fix Email Field Autofill Concatenation Bug

### Problem
Browser autofill populates the email field, but subsequent typing appends to the autofilled value instead of replacing it. This is a known React controlled-input + browser autofill interaction issue.

### Fix in `src/pages/ProOnboard.tsx`

**Line 321** — Add `autoComplete="off"` and `onFocus` select-all to the email input:

```tsx
<Input id="email" type="email" autoComplete="off" value={email}
  onChange={(e) => setEmail(e.target.value)}
  onFocus={(e) => e.target.select()}
  placeholder="info@agency.com" />
```

Apply the same treatment to other Step 1 fields (company name, contact name, phone, website, address) to prevent the same issue across all inputs.

### Files Modified
- `src/pages/ProOnboard.tsx` — add `autoComplete="off"` and `onFocus` select-all to all Step 1 form inputs

