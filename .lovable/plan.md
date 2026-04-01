
Fix `/pro/onboard` Step 1 by removing the broken dependency on the separate `address` string and validating against the real address state the UI already uses.

1. Root cause to fix
- The screen shows a confirmed address, but the Continue button checks `address.trim()`.
- That `address` value is rebuilt inside `handleAddressChange` from stale `addressData`, so later updates can wipe it back to empty.
- Result: the UI looks valid, but the submit gate still thinks a required field is missing.

2. Update Step 1 validation in `src/pages/ProOnboard.tsx`
- Replace `address.trim()` checks with a derived `hasConfirmedAddress` boolean based on:
  - `addressConfirmed`
  - `addressData.streetAddress`
  - `addressData.latitude` and `addressData.longitude`
- Use this same boolean everywhere for consistency:
  - `canProceedStep1`
  - the Continue button handler
  - the address validation icon if needed

3. Stop storing duplicated address truth
- Remove the fragile “reconstruct address on every field change” logic as the source of validation truth.
- Instead derive a final address string only when needed for API calls:
  - for `onboard-agency`
  - for `publish-agent-profile`
- Build it from `addressData` at send time so the backend always gets the confirmed location shown in the UI.

4. Improve the Continue button UX
- Replace the generic “Please fill in all required fields” toast with a more precise message.
- Validate fields in order and show the first real blocker, for example:
  - agency name missing
  - contact name missing
  - invalid/duplicate email
  - phone missing
  - address not confirmed on map
- This makes the failure understandable instead of looking broken.

5. Make address confirmation harder to desync
- When the user returns from verify to search or clears the address, ensure `addressConfirmed` is reset.
- When location is confirmed, use the confirmed address state as the single source of truth.
- Optionally show a small inline error/help text under the address field when the map pin has not been confirmed yet.

6. Keep Step 2 trigger intact
- After the validation fix, Continue should reliably call `setStep(1)`.
- The existing `useEffect` that runs `runAiOnboarding()` on Step 2 can stay as-is.

Files
- `src/pages/ProOnboard.tsx` — fix validation source of truth, derive request address correctly, improve toast/error UX

Technical notes
- Best derived field for validation:
  - `const hasConfirmedAddress = addressConfirmed && !!addressData.streetAddress?.trim() && typeof addressData.latitude === "number" && typeof addressData.longitude === "number"`
- Best derived field for API payload:
  - join `streetAddress`, `urbanization`, `city`, `province`, `country` with commas only at request time
- `canProceedStep1` is currently unused as a real gate outside Step 1 and should either be updated to the new logic or removed to avoid future drift
