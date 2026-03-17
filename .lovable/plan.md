

## Plan: Add URL Input Mode to ValuationTicketCard for BUY

### Problem
When the user toggles to BUY mode on the landing page, the card still shows the Google Address input. It should show a URL paste field instead.

### Changes

**1. `src/components/ValuationTicketCard.tsx`**

Add new props: `listingUrl?: string`, `onListingUrlChange?: (url: string) => void`

In the input rendering section (lines ~333-381), add a branch: when `valuationType === "buy"`, render a URL input instead of GoogleAddressInput:
- Icon: `Link2` (from lucide) instead of `MapPin`
- Placeholder: `"https://www.idealista.com/inmueble/12345678/"`
- Platform detection badge (Idealista/Fotocasa/Kyero/SpainHouses) shown inline when URL matches
- Cursive label changes to "Your Analysis" instead of "Your Valuation"
- Continue button navigates to `/buy` (already handled by `handleGetValuation` in Index.tsx)
- The SkyToggle stays below the input in both modes

**2. `src/pages/Index.tsx`**

Add state: `const [listingUrl, setListingUrl] = useState("")`

Pass new props to ValuationTicketCard:
- `listingUrl={listingUrl}`
- `onListingUrlChange={setListingUrl}`

Update `handleGetValuation` for buy mode: navigate to `/buy` with the URL as state so BuyAnalysis can pre-fill it.

### Files Modified
- `src/components/ValuationTicketCard.tsx` — new URL input branch for buy mode
- `src/pages/Index.tsx` — new state + pass props

