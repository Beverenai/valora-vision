

## Plan: Consolidate Pages, Add Admin + Lookup, Fix Address Step

### Current State
- **Duplicate pages**: `Sell.tsx` and `Rent.tsx` are landing pages with their own hero/FAQ/testimonials. `Index.tsx` is the main landing. `SellValuation.tsx` and `RentValuation.tsx` are the ticket-card wizards. `SellResult.tsx` and `RentResult.tsx` show results.
- **Address bug**: In `SellValuation.tsx`, the location step (step 0) renders `SellLocationStep` which embeds `GoogleAddressInput`. But `GoogleAddressInput` has a two-phase flow (search → verify with map → "Confirm Location" button). The "Confirm Location" calls `onLocationConfirmed` which triggers `handleNextStep`. This works, but the user says "it should work immediately" — the issue is the card starts collapsed (`isExpanded=false`) showing only the `ValuationTicketCard` in "input" mode, which has its own separate address input. So the user types an address in one input, clicks continue, then sees the Location step with another `GoogleAddressInput`. This is redundant. The fix: when the user enters an address and clicks continue from the initial card, skip step 0 (location) and go directly to step 1 (details), OR remove the initial collapsed card and start directly with the expanded form where step 0's `GoogleAddressInput` works immediately.

### Plan

#### 1. Delete redundant pages
- Delete `src/pages/Sell.tsx` (landing page duplicate)
- Delete `src/pages/Rent.tsx` (landing page duplicate)  
- Remove their routes from `App.tsx`
- Update `Index.tsx` links that point to `/sell` or `/rent` to point to `/sell/valuation` and `/rent/valuation`
- Update any `Navbar`, `Footer`, `CTABanner`, `InlineCTA` references

#### 2. Fix address step — start expanded immediately
- In `SellValuation.tsx` and `RentValuation.tsx`: remove the `isExpanded` toggle and the initial `ValuationTicketCard` "input" mode
- Always show the expanded card form, starting at step 0 (Location)
- The `GoogleAddressInput` search → verify → confirm flow works as the first interaction
- If address was passed via `location.state`, pre-populate and auto-enter verify phase

#### 3. Add valuation lookup page (`/lookup`)
- New page: `src/pages/ValuationLookup.tsx`
- Simple input: "Enter your reference code (e.g. VC-A1B2-C3D4)"
- Parse the ref code back to partial UUID, query `leads_sell` and `leads_rent` by ID prefix match
- Navigate to `/sell/result/:id` or `/rent/result/:id`

#### 4. Add admin dashboard (`/admin`)
- New page: `src/pages/Admin.tsx`
- Protected by a simple password check (stored as env secret)
- Table view of all valuations from `leads_sell` and `leads_rent`
- Columns: date, name, email, address, type (sell/rent), status, estimated value, ref code
- Click to view full result
- Basic filters: by status, by type, date range

#### 5. Update routing
```text
Routes:
  /                    → Index (landing)
  /sell/valuation      → SellValuation (wizard)
  /rent/valuation      → RentValuation (wizard)  
  /sell/result/:id     → SellResult
  /rent/result/:id     → RentResult
  /lookup              → ValuationLookup (new)
  /admin               → Admin (new)
```

### Files Changed
- **Delete** `src/pages/Sell.tsx`, `src/pages/Rent.tsx`
- **Edit** `src/App.tsx` — remove Sell/Rent routes, add `/lookup` and `/admin`
- **Edit** `src/pages/SellValuation.tsx` — remove `isExpanded` state, always show expanded card starting at step 0
- **Edit** `src/pages/RentValuation.tsx` — same
- **Edit** `src/components/Navbar.tsx` — update nav links
- **Edit** `src/pages/Index.tsx` — update any `/sell` or `/rent` links
- **New** `src/pages/ValuationLookup.tsx` — ref code search
- **New** `src/pages/Admin.tsx` — admin dashboard with leads table
- **New secret** — `ADMIN_PASSWORD` for admin access

