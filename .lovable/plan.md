

## Plan: Restore ValuationTicketCard as Hero, Embed GoogleAddressInput Inside It

### Problem
The last change replaced the `ValuationTicketCard` hero with a raw `GoogleAddressInput` + plain text. The card IS the signature hero element and must remain.

### Solution
Restore the `ValuationTicketCard` in "input" mode as the hero centerpiece, but replace its internal plain `<input>` with the `GoogleAddressInput` component so address autocomplete works directly inside the card.

### Changes

**`src/pages/Index.tsx`**:
- Restore `ValuationTicketCard` as the hero element (mode="input")
- Remove the raw `GoogleAddressInput` and plain text hero
- Pass `onContinue` that navigates to `/sell/valuation` with address data

**`src/components/ValuationTicketCard.tsx`**:
- In the "input" mode section (lines 260-289), replace the plain `<input>` with `GoogleAddressInput`
- Accept new props: `addressData` object and `onAddressFieldChange` callback (for the Google component's `onChange`)
- When `onLocationConfirmed` fires inside the card, call the existing `onContinue` prop
- Remove the old `addressValue`/`onAddressChange` plain-text props (or keep as fallback)

### Result
- Hero shows the beautiful ticket card with 3D tilt, hero image, accent circles
- Inside the card, users get full Google autocomplete → map verify → confirm
- On confirm, navigates to `/sell/valuation` with pre-filled address data, starting at step 1

