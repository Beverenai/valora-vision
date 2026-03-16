

## Plan: Card-Driven Valuation Flow — No Navbar, Card "Pops Open" into Form Steps

### Concept

The `/sell/valuation` page becomes a clean, single-page experience. No navbar, no progress indicator at the top. The `ValuationTicketCard` IS the interface. User enters address in the card, then the card animates open (expands) to reveal the form steps inline. At the bottom: "Are you a real estate agent?" prompt.

### Changes

**1. `src/pages/SellValuation.tsx` — Full redesign**

- Remove `<Navbar />`, `<Footer />`, and `<ProgressIndicator />`
- Remove the standard card/border wrapper and `StepNavigation` component
- New layout:
  - **Step 0 (Address)**: Show `ValuationTicketCard` in input mode, centered. Card is wider on desktop (`max-w-[500px] md:max-w-[700px]`). No "Get Valuation" button — instead a subtle "Continue →" arrow appears once address is filled
  - **Steps 1-3 (Details/Features/Contact)**: Card "pops open" — an expanded panel slides down below the card (or the card itself scales up) revealing the form fields. The card stays visible at top as a visual anchor showing the entered address. Form content appears below it with smooth animation
- Keep the form wizard logic (`useFormWizard`), submission, and validation as-is
- Back navigation: small back arrow, no full button bar
- Bottom of page: simple text link "Are you a real estate agent? → Sign up here"

**2. `src/components/ValuationTicketCard.tsx` — Wider desktop sizing**

- Change `max-w-[280px] md:max-w-[340px]` to `max-w-[320px] md:max-w-[520px]`
- Adjust `min-h` accordingly for wider aspect ratio on desktop (move from 9:16 to ~3:4 on desktop)
- Remove the "Get Valuation" button from input mode — replace with a simple "Continue →" text/arrow that appears when `addressValue` has content
- Add an `onContinue` callback prop (replaces `onSubmit` semantics)

**3. Card "pop open" animation**

- When user taps Continue on the card, the parent page transitions:
  - Card shrinks slightly and moves to top
  - A form panel expands below with the current step content
  - Use CSS transitions (`max-height`, `opacity`, `transform`) — no framer-motion
- The card shows a mini summary (address entered) while form is open
- Stepping through 1→2→3 just swaps the form content below the card

### Flow
```text
┌─────────────────────┐
│   ValuationTicketCard│  ← Address input mode, wide on desktop
│   [Enter address...] │
│        Continue →    │
└─────────────────────┘

     ↓ (after address entered + continue)

┌─────────────────────┐
│  📍 Calle Example   │  ← Card shrinks, shows address
└─────────────────────┘
┌─────────────────────┐
│  Property Details    │  ← Form step content expands below
│  Type: Villa ▾       │
│  Size: _____ m²     │
│  Beds: 1 2 3 4 5+   │
│        ← Back  Next →│
└─────────────────────┘

     ↓ bottom of page

"Are you a real estate agent? Sign up →"
```

