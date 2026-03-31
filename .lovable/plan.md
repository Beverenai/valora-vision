

## Plan: Agent Profile Page (`/agentes/:slug`)

This is a large feature spanning database schema changes, a new page component, and a route addition. We'll extend the existing `professionals` table rather than creating a parallel `agencies` table, keeping the data model clean.

---

### 1. Database Migration

Extend existing tables and add new ones:

**Alter `professionals` table** — add missing columns:
- `slug` (text, unique, not null)
- `cover_photo_url` (text)
- `tagline` (text)
- `avg_rating` (numeric, default 0)
- `total_reviews` (integer, default 0)
- `founded_year` (integer)
- `team_size` (integer)
- `office_address` (text)
- `instagram_url` (text)
- `facebook_url` (text)
- `linkedin_url` (text)
- `service_zones` (uuid[], references zones)
- `description` (text) — rename/alias from `bio`

**Create `agent_team_members` table:**
```
id uuid PK
professional_id uuid FK → professionals(id) ON DELETE CASCADE
name text NOT NULL
role text
photo_url text
avg_rating numeric DEFAULT 0
total_reviews integer DEFAULT 0
languages text[]
email text
phone text
sort_order integer DEFAULT 0
```
RLS: publicly readable.

**Create `agent_reviews` table:**
```
id uuid PK
professional_id uuid FK → professionals(id) ON DELETE CASCADE
reviewer_name text NOT NULL
reviewer_role text (seller/buyer/landlord)
rating integer NOT NULL CHECK 1-5
comment text
is_verified boolean DEFAULT false
lead_id uuid (optional link to valuation)
created_at timestamptz DEFAULT now()
```
RLS: publicly readable, anyone can insert.

**Create `agent_contact_requests` table:**
```
id uuid PK
professional_id uuid FK → professionals(id)
name text NOT NULL
email text NOT NULL
phone text
interest text (selling/buying/renting/valuation/other)
message text
created_at timestamptz DEFAULT now()
```
RLS: anyone can insert, service_role can read.

---

### 2. New Page: `src/pages/AgentProfile.tsx`

Full-page component reading from Supabase. Sections:

1. **Hero/Header** — Cover photo (or warm terracotta gradient fallback), overlapping circular logo (initials fallback), agency name in serif heading, star rating + review count + verified badge, tagline, two CTA buttons (Contact / Website)

2. **Stats Bar** — Horizontal row: city/location, property count from `professional_zones`, founded year, team size, languages as flag badges. Horizontally scrollable on mobile.

3. **About** — Section label "ABOUT" (uppercase tracked), description text, social media icon links (only rendered if URL exists)

4. **Team** — Section label "OUR TEAM", grid of team member cards from `agent_team_members`. Hidden if empty. 2-3 columns desktop, 1 mobile.

5. **Service Areas** — Section label "SERVICE AREAS", zone name badges from `service_zones` joined with `zones` table. No map initially (Mapbox would need API key).

6. **Reviews** — Section label "CLIENT REVIEWS", summary bar (avg rating, count, star distribution), individual review cards with role badges, "Load more" if > 5. Empty state: "Be the first to review" with submit form.

7. **Contact Form** — On desktop: sticky sidebar (right column in a 2-column layout wrapping sections 3-6). On mobile: full-width section at bottom with sticky "Contact" button. Fields: name, email, phone, interest dropdown, message (pre-filled). Inserts into `agent_contact_requests`.

8. **Footer note** — "Valuation powered by ValoraCasa" link + disclaimer

**Layout approach**: Desktop uses a `grid grid-cols-[1fr_380px]` from the About section onwards, with the contact form as the sticky right column. Mobile stacks everything linearly.

**SEO**: Dynamic `document.title` and meta description via `useEffect`.

**Breadcrumbs**: Home > Agents > [Agency Name]

---

### 3. Route Addition

**`src/App.tsx`** — Add:
```tsx
<Route path="/agentes/:slug" element={<AgentProfile />} />
```

---

### 4. Update ProfessionalSpotlight Link

**`src/pages/SellResult.tsx`** — Change the "View Profile" button `onViewProfile` to navigate to `/agentes/:slug` instead of showing a toast.

---

### Files Created
- `src/pages/AgentProfile.tsx` — main profile page (~500 lines)

### Files Modified
- `src/App.tsx` — add route
- `src/pages/SellResult.tsx` — link View Profile to actual page

### Database Migration
- Alter `professionals` + create 3 new tables

### Implementation Order
1. Database migration (alter + create tables)
2. Create `AgentProfile.tsx` page with all sections
3. Add route in `App.tsx`
4. Update SellResult spotlight link

