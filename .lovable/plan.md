

# Phase 1: Foundation — Shared Form Infrastructure

## What exists
- **V2** has landing pages (/, /sell, /rent), Navbar, Footer, design system (navy/gold/teal), and all shadcn/UI components
- **V1** has a working 3-step form wizard with Google Maps address input, phone input with country codes, property type 2-level selector, and step navigation

## What Phase 1 builds

### 1. Form Wizard Hook
Copy V1's `use-form-wizard.tsx` to `src/hooks/use-form-wizard.tsx`. It's a generic hook that manages step state, direction, progress, and validation — works as-is for both Sell and Rent forms.

### 2. Google Maps Address Input
Port from V1 with these files:
- `src/components/shared/GoogleMapsAddressInput.tsx` — main component using `@react-google-maps/api`
- `src/components/shared/AddressSearchInput.tsx` — autocomplete dropdown using `use-places-autocomplete`
- `src/utils/addressUtils.ts` — geocoding helpers

**Dependencies needed:** `@react-google-maps/api`, `use-places-autocomplete`, `@types/google.maps`

**Note:** The V1 component has a hardcoded Google Maps API key. For V2, we'll store it as a Vite env variable (`VITE_GOOGLE_MAPS_API_KEY`) with a fallback.

### 3. Phone Input with Country Codes
Port V1's `PhoneInput.tsx` to `src/components/shared/PhoneInput.tsx`. Already uses shadcn Command/Popover. Update styling to V2 design system (use `border-input` instead of `border-gray-300`, etc).

### 4. Property Type Selector
Extract V1's 2-level type selector (5 categories → 16 types) into `src/components/shared/PropertyTypeSelector.tsx`. Decouple from V1's `PropertyValuationData` type — make it accept generic `value`/`onChange` props.

### 5. Form Step Components (Shared)
Create shared form step infrastructure styled with V2's navy/gold design system:
- `src/components/shared/FormStepWrapper.tsx` — animated container with framer-motion slide transitions
- `src/components/shared/StepNavigation.tsx` — Back (outline) / Continue (navy filled) buttons, adapted from V1
- `src/components/shared/ProgressIndicator.tsx` — thin gradient progress bar (navy → gold), adapted from V1's desktop+mobile versions
- `src/components/shared/LoadingOverlay.tsx` — processing overlay with progress simulation, adapted from V1

### 6. Confetti Animation
Copy V1's `ConfettiAnimation.tsx` to `src/components/shared/ConfettiAnimation.tsx` as-is (CSS keyframes for confetti-fall, confetti-sway, confetti-shimmer need to be added to tailwind config).

### 7. Type Definitions
Create `src/types/valuation.ts` with shared interfaces:
- `AddressData` (street, urbanization, city, province, country, complex)
- `SellValuationData` (extends with property details, sell-specific features, contact)
- `RentValuationData` (extends with rental-specific fields: furnished, AC, tourist license, beach proximity)
- `PropertyCategory`, `PropertyType` enums

### 8. Routes
Add placeholder routes to `App.tsx`:
- `/sell/valuation` → SellValuation page (placeholder with form wizard shell)
- `/rent/valuation` → RentValuation page (placeholder)
- `/sell/result/:id` → placeholder
- `/rent/result/:id` → placeholder

## Files created/modified

| File | Action |
|------|--------|
| `src/hooks/use-form-wizard.tsx` | Port from V1 |
| `src/types/valuation.ts` | New — shared type definitions |
| `src/utils/addressUtils.ts` | Port from V1 |
| `src/components/shared/GoogleMapsAddressInput.tsx` | Port + restyle |
| `src/components/shared/AddressSearchInput.tsx` | Port + restyle |
| `src/components/shared/PhoneInput.tsx` | Port + restyle |
| `src/components/shared/PropertyTypeSelector.tsx` | Extract from V1 |
| `src/components/shared/FormStepWrapper.tsx` | New |
| `src/components/shared/StepNavigation.tsx` | Port + restyle |
| `src/components/shared/ProgressIndicator.tsx` | Port + restyle |
| `src/components/shared/LoadingOverlay.tsx` | Port + restyle |
| `src/components/shared/ConfettiAnimation.tsx` | Port from V1 |
| `src/pages/SellValuation.tsx` | New — placeholder with form shell |
| `src/pages/RentValuation.tsx` | New — placeholder |
| `src/pages/SellResult.tsx` | New — placeholder |
| `src/pages/RentResult.tsx` | New — placeholder |
| `src/App.tsx` | Add 4 new routes |
| `tailwind.config.ts` | Add confetti keyframes/animations |
| `package.json` | Add google maps + use-places-autocomplete deps |

## Dependencies to add
- `@react-google-maps/api` — Google Maps loader
- `use-places-autocomplete` — address autocomplete
- `@types/google.maps` — TypeScript types for Google Maps

## Design adaptation notes
All ported components will be restyled to use V2's design tokens:
- Navy buttons instead of generic gradients
- `border-input` instead of `border-gray-300`
- V2's `font-heading` for step titles
- Gold accent on progress bar gradient
- 48px minimum touch targets on mobile inputs

