

## Plan: SEO — Titles, Meta Descriptions, and OpenGraph Tags

### Problem
- `index.html` has placeholder titles/descriptions ("Lovable App", "Lovable Generated Project")
- Most pages set `document.title` but none set `<meta description>` or OG tags dynamically
- Index page doesn't set `document.title` at all
- Agent profile title missing city name

### Approach
Create a small `useSEO` hook that sets `document.title`, `meta description`, `og:title`, `og:description`, and `twitter:title`/`twitter:description` on mount. Each page calls it with appropriate values.

### Changes

**1. Update `index.html`** — Set proper defaults
- Title: `"ValoraCasa — Free Property Valuations in Costa del Sol"`
- Description: `"Get a free, instant property valuation for Costa del Sol. Compare agents, analyze listings, and make informed real estate decisions."`
- OG/Twitter title and description: match the above

**2. New file: `src/hooks/use-seo.ts`**
```ts
export function useSEO({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
  }, [title, description]);
}
```
Helper `setMeta` finds existing tag or creates one.

**3. Update pages to use `useSEO`** — replace bare `document.title` calls:

| Page | Title | Description |
|------|-------|-------------|
| `Index.tsx` | `ValoraCasa — Free Property Valuations in Costa del Sol` | `Get a free, instant property valuation...` |
| `AgentProfile.tsx` | `{name} — Real Estate Agent in {city} \| ValoraCasa` | `{tagline or description snippet}` |
| `AgentDirectory.tsx` | `Real Estate Agents in Costa del Sol \| ValoraCasa` | `Browse verified real estate agents across Costa del Sol...` |
| `ProLanding.tsx` | `For Agents — List Your Agency on ValoraCasa` | `Join ValoraCasa to receive qualified leads...` |
| `SellValuation.tsx` | `Free Property Valuation \| ValoraCasa` | `Get an instant, free valuation for your property in Costa del Sol.` |
| `RentValuation.tsx` | `Free Rental Estimate \| ValoraCasa` | `Find out what your property could rent for in Costa del Sol.` |
| `SellResult.tsx` | `Your Property Valuation \| ValoraCasa` | `View your personalized property valuation report.` |
| `RentResult.tsx` | `Your Rental Estimate \| ValoraCasa` | `View your personalized rental estimate report.` |
| `BuyAnalysis.tsx` | `Buy Analysis \| ValoraCasa` | `Analyze any property listing to see if the price is fair.` |
| `BuyResult.tsx` | `Price Analysis \| ValoraCasa` | `See a detailed price analysis for this property listing.` |
| `ProDashboard.tsx` | `Agent Dashboard \| ValoraCasa` | `Manage your profile, leads, and analytics.` |
| `ProOnboard.tsx` | `Join ValoraCasa \| Agent Onboarding` | `Create your agency profile and start receiving leads.` |
| `ProOnboardSuccess.tsx` | `Welcome to ValoraCasa!` | `Your agency profile is live.` |
| `ProLogin.tsx` | `Agent Login \| ValoraCasa` | `Sign in to your ValoraCasa agent dashboard.` |
| `ValuationLookup.tsx` | `Look Up Your Valuation \| ValoraCasa` | `Retrieve a previous valuation using your reference code.` |

**4. Agent profile city in title**
- Use the first zone name (already fetched) or `prof.city` field: `${prof.company_name} — Real Estate Agent in ${primaryCity} | ValoraCasa`

### Files
- **Modified**: `index.html`
- **New**: `src/hooks/use-seo.ts`
- **Modified**: All 15 page files listed above (replace `document.title` with `useSEO` call)

