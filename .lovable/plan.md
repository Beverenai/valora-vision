

## Plan: Agent Onboarding Flow (Full Build)

A complete B2B agent onboarding system with 3 new pages, authentication, an AI-powered profile generation edge function, and database updates.

---

### 1. Database Migration

**Alter `professionals` table:**
- Ensure `user_id` references `auth.users(id)` (currently nullable — keep nullable but populate on signup)

**Create `user_roles` table** (required for admin vs agent access):
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
-- RLS + security definer function has_role()
```

**Add RLS policies to `professionals`:**
- Agents can UPDATE their own row (`user_id = auth.uid()`)
- Agents can INSERT if they don't already have a profile

**Add INSERT policy to `agent_team_members`:**
- Agents can insert/update/delete team members for their own professional_id

---

### 2. Authentication Setup

- Use `cloud--configure_auth` to enable email/password auth
- Create `src/pages/ProLogin.tsx` — simple login/signup form for agents
- Create `src/pages/ResetPassword.tsx` — password reset page
- On signup during onboarding: create auth user, assign `agent` role, link to `professionals` row

---

### 3. Edge Function: `onboard-agency`

**`supabase/functions/onboard-agency/index.ts`**

Input: `{ name, email, website, address, phone }`

Processing pipeline:
1. **If website provided**: Use Firecrawl (already connected) to scrape the website → extract logo, team members, social links from the HTML/content
2. **Lovable AI** (gemini-3-flash-preview): Generate a 2-3 sentence agency description from the scraped content + name + location
3. **Google Places API** (`VITE_GOOGLE_MAPS_API_KEY`): Search for the business by name + address → fetch rating, review count
4. **Geocode** the office address using Google Geocoding API

Output: JSON with `logo_url`, `description`, `team[]`, `social{}`, `google_rating`, `google_review_count`, `languages[]`, `lat`, `lng`

---

### 4. New Pages

**`src/pages/ProLanding.tsx`** (`/pro`)
- Hero section with headline, subhead, CTA button
- "How it works" 3-step visual
- Pricing cards (3 tiers: Basic €149, Premium €299, Elite €499) with feature comparison
- Social proof section with live valuation count from DB
- FAQ accordion (5 questions)
- Footer CTA

**`src/pages/ProOnboard.tsx`** (`/pro/onboard`)
- 3-step wizard using existing `useFormWizard` hook pattern
- **Step 1**: Form fields (agency name, your name, email, phone, website, office address with Google autocomplete)
- **Step 2**: AI progress screen — animated checklist items appearing one by one. Calls `onboard-agency` edge function. Auto-advances when done. "Skip" link as fallback.
- **Step 3**: Live profile preview (reuses AgentProfile layout) with inline edit capabilities. Logo/cover upload, editable description textarea, team member add/remove, service area multi-select, language multi-select, social link inputs.
- "Publish" button: creates Supabase Auth account → inserts `professionals` row → inserts `user_roles` → redirects to success

**`src/pages/ProOnboardSuccess.tsx`** (`/pro/onboard/success`)
- Welcome screen with confetti
- Link to view profile (`/agentes/:slug`)
- Link to choose plan
- Next steps checklist

---

### 5. Routes

Add to `src/App.tsx`:
```tsx
<Route path="/pro" element={<ProLanding />} />
<Route path="/pro/onboard" element={<ProOnboard />} />
<Route path="/pro/onboard/success" element={<ProOnboardSuccess />} />
<Route path="/pro/login" element={<ProLogin />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

Add "For Agents" link to Navbar.

---

### 6. Firecrawl Integration

The prompt requires scraping agent websites. Check if Firecrawl connector is already linked; if not, connect it. The edge function will use `FIRECRAWL_API_KEY` to call the scrape API for extracting logo, team, and social links from the agency website.

---

### Files Created
- `src/pages/ProLanding.tsx`
- `src/pages/ProOnboard.tsx`
- `src/pages/ProOnboardSuccess.tsx`
- `src/pages/ProLogin.tsx`
- `src/pages/ResetPassword.tsx`
- `supabase/functions/onboard-agency/index.ts`

### Files Modified
- `src/App.tsx` — add 5 new routes
- `src/components/Navbar.tsx` — add "For Agents" link
- Database migration (user_roles table, RLS policies)

### Secrets Required
- `LOVABLE_API_KEY` — already configured
- `VITE_GOOGLE_MAPS_API_KEY` — already configured (will use for Places + Geocoding in edge function; need to also add as a runtime secret)
- `FIRECRAWL_API_KEY` — needs connector check/link

### Implementation Order
1. Database migration (user_roles, RLS updates)
2. Configure auth (email/password)
3. Connect Firecrawl if needed
4. Add Google Maps API key as runtime secret
5. `onboard-agency` edge function
6. `ProLanding.tsx` — B2B landing page
7. `ProOnboard.tsx` — 3-step wizard
8. `ProOnboardSuccess.tsx` — success page
9. `ProLogin.tsx` + `ResetPassword.tsx` — auth pages
10. Routes + Navbar update

