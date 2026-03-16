

## Plan: Make carousel property cards clickable to start valuation

The `SellValuation` page already accepts pre-filled address data via React Router's `location.state.address`. We just need to make the active property card in the carousel clickable.

### Changes

**`src/components/PropertyShowcaseCarousel.tsx`**

- Import `useNavigate` from `react-router-dom`
- Add a click handler on the active card's overlay (the bottom info area with price) that navigates to `/sell/valuation` with the property's city pre-filled:
  ```ts
  navigate("/sell/valuation", { state: { address: { city: cityName } } })
  ```
- Parse the city name from the `city` field (e.g. "Marbella, Costa del Sol" → city: "Marbella", province: "Costa del Sol")
- Add a subtle "Get Valuation →" CTA button in the active card's bottom overlay, next to the price info
- Add `cursor-pointer` to the active card container
- Keep non-active cards non-clickable

