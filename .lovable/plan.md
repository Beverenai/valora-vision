

# Keep Sell/Buy Focus + Add Rent as Secondary + Dynamic Navbar

## Approach

Keep the current Sell/Buy `SkyToggle` on the homepage exactly as-is. Rent is a secondary SEO play — it gets its own route (`/rent/valuation`) but does NOT appear on the homepage toggle.

The navbar becomes context-aware: it shows the two *other* services based on which page you're on.

## Changes

### 1. Dynamic Navbar (`src/components/Navbar.tsx`)

Detect current context from `location.pathname`:
- `/sell/*` or `/` → show **Rent** and **Buy** links
- `/rent/*` → show **Sell** and **Buy** links
- `/buy/*` → show **Sell** and **Rent** links
- Any other page → show **Sell**, **Rent**, **Buy**

Keep "Find an Agent" and "For Agents" always visible. CTA button adapts:
- Sell context → "Get Valuation" → `/sell/valuation`
- Rent context → "Estimate Rent" → `/rent/valuation`
- Buy context → "Analyze Price" → `/buy`
- Default → "Get Valuation" → `/sell/valuation`

### 2. Add `/rent` route as alias (`src/App.tsx`)

Add `<Route path="/rent" element={<Navigate to="/rent/valuation" replace />} />` for cleaner URLs, matching the existing `/vender` → `/sell/valuation` pattern.

### 3. No changes to Index.tsx

The homepage stays Sell/Buy toggle. Rent traffic comes organically via direct links, navbar links from other pages, and SEO.

### Files Modified

- `src/components/Navbar.tsx` — context-aware link filtering + adaptive CTA
- `src/App.tsx` — add `/rent` redirect route

