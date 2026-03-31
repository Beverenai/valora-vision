

## Plan: Agent Directory Page (`/agentes`)

### Overview
Create a new page at `/agentes` that lists all published agents with search, filtering, and sorting. Add route to App.tsx.

### 1. New File: `src/pages/AgentDirectory.tsx`

**Hero Section**
- Headline: "Find a Real Estate Expert" (serif font)
- Subline: "Verified agents across Costa del Sol"
- No Mapbox — use a simple text search input that filters by company name or location

**Filter Bar** (horizontal, sticky below hero)
- Location dropdown: hardcoded municipalities (Marbella, Estepona, Benahavís, Mijas, Fuengirola, Benalmádena, Torremolinos, Málaga, Nerja, Manilva)
- Language multi-select: EN, ES, NO, SV, DE, FR, NL
- Sort: "Highest rated" (default), "Most reviews"
- Note: "Nearest to you" skipped for now (no geolocation column on professionals table; can add later)

**Agent Cards Grid**
- 3 columns desktop, 1 mobile
- Each card: circular logo (48px) with initials fallback (terracotta bg), company name, star rating + review count, truncated description, primary zone name (fetched from `zones` table via `service_zones[0]`), language badges, "View Profile" link to `/agentes/:slug`
- Verified badge (green checkmark) if `is_verified = true`

**Data Query**
- Query `professionals` table where `is_active = true`
- Join zone names via a separate query on `zones` for display
- Client-side filtering by location (match zone names), language (intersect `languages` array)
- Client-side sorting by `avg_rating` or `total_reviews`
- Pagination: "Load more" button, 12 per page

**Empty State**
- "No agents found in this area. Try expanding your search."

**SEO**
- `document.title = "Real Estate Agents in Costa del Sol | ValoraCasa"`

### 2. Update `src/App.tsx`
- Add route: `<Route path="/agentes" element={<AgentDirectory />} />`
- Place above the existing `/agentes/:slug` route

### Files
- **New**: `src/pages/AgentDirectory.tsx`
- **Modified**: `src/App.tsx` (add route)

