

## Plan: Adapt "How It Works" Steps for BUY Mode

### Problem
The three "How It Works" steps currently show SELL-specific content regardless of the toggle state. When BUY is selected, the steps should reflect the buy flow: paste a link → automatic analysis → get your price score.

### Changes

**`src/pages/Index.tsx`** — Lines 276-430

Make the step content conditional on `isSell`:

| Step | SELL (current) | BUY (new) |
|------|---------------|-----------|
| **01** | "Enter your address" + address input mockup | "Paste a listing link" + URL mockup showing `idealista.com/inmueble/1234...` with Link2 icon |
| **02** | "Tell us about your property" + bed/bath/size pills | "We analyze the market" + mini mockup showing scanning animation or comparable count badge (e.g. "18 comparable properties found") |
| **03** | "See what you'll receive" + valuation card | "Get your price score" + description about price verdict, comparable analysis, negotiation hints |

Also update the section subtitle conditionally:
- SELL: "From address to valuation in under two minutes"
- BUY: "From listing link to price analysis in seconds"

The showcase card below step 3 already adapts via `valuationType` — no change needed there.

### Files Modified
- `src/pages/Index.tsx` — conditional step content in the How It Works section

