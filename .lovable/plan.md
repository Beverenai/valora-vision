
# AgentProfile Enhancement Plan

## Overview
Enhance the agent profile page with 7 features while preserving ALL existing functionality (contact form, team, reviews, social links, skeleton, error states).

## Database
✅ `agent_sales` table already exists with all needed fields (sale_price, property_type, sale_date, latitude, longitude, bedrooms, city, address_text, photo_url, verified, show_price, team_member_id, professional_id).
✅ `zones` table has `province` and `name` fields for breadcrumb data.
**No migrations needed.**

## Implementation Steps

### Step 1: Enhanced Breadcrumbs
- Replace current simple breadcrumb (lines 473-482) with Shadcn `Breadcrumb` components
- Path: `Inicio > Agentes > [Provincia] > [Ciudad] > [Agencia] > [Agent Name]`
- Fetch province/city from zones data (zones table has `province` field — need to expand the zones query to include it)
- Agency name from existing `agency` state
- Mobile: collapse middle levels with `BreadcrumbEllipsis`
- Font-serif text, terracotta `#D4713B` hover color

### Step 2: Sales Statistics Section
- New section after agency card showing sales analytics
- Total sold (last 24 months), median sale price, breakdown by property type
- Animated count-up effect with framer-motion `useInView`
- Two stat boxes side by side, type breakdown underneath
- Uses existing `recentSales` state — no new queries

### Step 3: Property Map (Mapbox)
- Interactive map under sales stats showing sold properties
- Terracotta markers for sold, green for active
- Click popup with photo, type, bedrooms, price, location
- Centered on agent's service zones
- Fallback static placeholder if no VITE_MAPBOX_TOKEN
- Lazy-loaded with `React.lazy`

### Step 4: Property Cards with Pagination
- Horizontal card grid under map
- Status badge: "VENDIDO" (terracotta) or "EN VENTA" (green)
- Sale date, property type + bedrooms, location
- "Vendido por [agent] de [agency]" attribution
- Pagination: 5 per page with Anterior/1 2 3/Siguiente

### Step 5: Enhanced Agency Linking
- Improve agency card: add MapPin icon + address, "Ver más" link
- Below agency card: avatar chips of other agents in agency
- `[photo] María López [photo] Juan García +3 más`
- Click navigates to agent profile

### Step 6: Improved Contact Form
- Desktop: already sticky (✅ exists at line 776)
- Mobile: fixed "Contactar" button at bottom opening sheet/modal with form
- "Mostrar número" button (reveals phone on click)
- Enhanced service dropdown: Valoración, Vender, Comprar, Alquiler, Otro

### Step 7: Responsive Polish
- Mobile-first layouts for all new sections
- Lazy-load map and stats sections
- framer-motion entrance animations
- Consistent terracotta accent and font-serif headings

## Files Modified
- `src/pages/AgentProfile.tsx` — main changes
- New: `src/components/agent/AgentSalesStats.tsx`
- New: `src/components/agent/AgentPropertyMap.tsx`  
- New: `src/components/agent/AgentPropertyCards.tsx`
- New: `src/components/agent/AgentBreadcrumbs.tsx`

## Design Tokens
- Terracotta: `#D4713B` (used as inline or via existing `--primary`)
- Font: `font-serif` for section headings
- Shadcn/UI components throughout
