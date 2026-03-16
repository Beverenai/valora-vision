

## Plan: Card-Wrapped Form + Auto-Advance on Location Confirm

### What changes

**1. Auto-advance on location confirm**

Pass `onLocationConfirmed` callback from `SellLocationStep` / `RentLocationStep` up to the parent page. When the user taps "Confirm Location" in the Google Maps verify phase, it calls `handleNextStep()` automatically — no separate "Next" button needed for step 0.

- `SellLocationStep` and `RentLocationStep` get a new `onLocationConfirmed` prop, which they pass to `GoogleAddressInput`
- `SellValuation.tsx` and `RentValuation.tsx` pass `handleNextStep` as the callback
- The location step validation already checks for `streetAddress || city`, so this is safe

**2. Card-wrapped form layout**

Instead of showing a small compact card above a separate form panel, the entire form lives **inside** the ValuationTicketCard's visual frame. The user feels like they're "in the card."

Changes to `SellValuation.tsx` and `RentValuation.tsx`:
- When `isExpanded`, remove the separate compact card + form panel layout
- Instead, render a single container styled like the ticket card: same `bg-[hsl(36_9%_88%)]`, same `rounded-[24px]`, same shadow (`shadow-[0_20px_50px_rgba(0,0,0,0.15)]`), same dashed right border stub
- The form steps render inside this card container, with the step indicator and navigation embedded within
- The hero image area shrinks to a thin header band showing the address + step dots
- The barcode stays at the bottom of the card

Layout when expanded:
```text
┌─────────────────────────────────┬──┐
│  📍 Calle Luna 12    ● ● ● ●   │  │
│  ─────────────────────────      │V │
│                                 │a │
│  [Form step content here]       │l │
│  (Location / Details / etc)     │o │
│                                 │r │
│  ─────────────────────────      │a │
│  ← Back              Next →    │  │
│  ▌▌▐▌▐▌▌▐▐▌▌▐▌▐▌▐▐▌▌▐▌▌       │  │
│         VALORACASA              │⊕ │
└─────────────────────────────────┴──┘
```

**3. Files changed**

- `src/components/sell/SellLocationStep.tsx` — add `onLocationConfirmed` prop, pass to `GoogleAddressInput`
- `src/components/rent/RentLocationStep.tsx` — same
- `src/pages/SellValuation.tsx` — card-wrapped layout, pass `handleNextStep` as location confirmed callback
- `src/pages/RentValuation.tsx` — same changes

