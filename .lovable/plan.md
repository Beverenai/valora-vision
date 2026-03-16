

## Plan: Fix Address Step to Require Map Confirmation Before Advancing

### Problem
Step 0 (Location) has two ways to advance: the "Confirm Location" button inside `GoogleAddressInput` (which properly requires map verification), and the "Next" button at the bottom of the card which only checks `streetAddress || city` — allowing users to skip map confirmation.

### Changes

**`src/pages/SellValuation.tsx`**:
1. Update `validateSellStep` case 0 to require `latitude` and `longitude` (not just `streetAddress || city`). This ensures "Next" is disabled until the user has confirmed on the map.
2. Hide the bottom "Next" button when on step 0, since `GoogleAddressInput`'s "Confirm Location" button already handles advancing via `onLocationConfirmed={handleNextStep}`.

**`src/pages/RentValuation.tsx`**:
- Same two changes for consistency.

### Result
- User searches address → selects from suggestions → sees map with pin → clicks "Confirm Location" → advances to step 1
- No way to skip map confirmation
- Bottom navigation only shows "Back" on step 0

