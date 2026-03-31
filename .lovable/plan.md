

## Plan: Agent Dashboard (`/pro/dashboard`)

### Overview
Create a sidebar-based dashboard for logged-in agents with 5 sections: Overview, Profile Editor, Leads, Analytics, and Subscription. Protected by auth — redirects to `/pro/login` if not logged in.

---

### 1. New Files

**`src/pages/ProDashboard.tsx`** — Main layout + routing
- Auth guard: check `supabase.auth.getSession()` on mount, redirect to `/pro/login` if no session
- Fetch the agent's `professionals` record by `user_id = auth.uid()`
- Desktop: Sidebar (left) + content area (right) using Shadcn Sidebar components
- Mobile: Bottom tab bar (Dashboard, Profile, Leads, More dropdown)
- Internal state `activeSection` controls which content panel renders
- Sections: `overview`, `profile`, `leads`, `analytics`, `subscription`

**Content Sections (all inline in ProDashboard or extracted as sub-components):**

**Overview Section:**
- Welcome: "Welcome back, {company_name}"
- 4 stat cards: Profile Views (from `professional_impressions` count this month), Leads Received (`agent_contact_requests` count this month), Average Rating, Search Appearances (impressions count)
- Recent leads table (last 5 from `agent_contact_requests` where `professional_id = agent.id`)
- "View all leads" link → switches to leads section

**Profile Section:**
- Editable form mirroring onboarding Step 3 fields (company name, tagline, description, logo, languages, service areas, social links, team)
- "Save changes" → `supabase.from('professionals').update(...)` with RLS (user owns record)
- "Preview public profile" → opens `/agentes/:slug` in new tab

**Leads Section:**
- Full table of `agent_contact_requests` for this professional
- Filter tabs: All, New, Contacted, Converted
- Each row: name, email, phone, message (truncated), date
- Expand row to see full message
- Note: status filtering requires a `status` column on `agent_contact_requests`

**Analytics Section:**
- Line chart: impressions over last 30 days (from `professional_impressions`, grouped by date)
- Bar chart: leads over last 30 days
- Stats row: total views, total leads, conversion rate
- "Detailed analytics coming soon with Premium plan" placeholder

**Subscription Section:**
- Current plan display (placeholder — "Free" for now)
- Pricing cards (reuse from `/pro` page or simplified version)
- "Manage subscription" button (placeholder)

### 2. Database Migration

Add `status` column to `agent_contact_requests`:
```sql
ALTER TABLE public.agent_contact_requests 
ADD COLUMN status text NOT NULL DEFAULT 'new';
```

Add RLS policy so agents can read their own contact requests:
```sql
CREATE POLICY "Agents can read own contact requests"
ON public.agent_contact_requests FOR SELECT TO authenticated
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));
```

Add RLS policy so agents can update status on their own contact requests:
```sql
CREATE POLICY "Agents can update own contact requests"
ON public.agent_contact_requests FOR UPDATE TO authenticated
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
))
WITH CHECK (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));
```

### 3. Update `src/App.tsx`
- Add route: `<Route path="/pro/dashboard" element={<ProDashboard />} />`

### 4. Update `src/pages/ProLogin.tsx`
- After successful login, navigate to `/pro/dashboard` instead of `/agentes/:slug`

### Files
- **New**: `src/pages/ProDashboard.tsx`
- **Modified**: `src/App.tsx` (add route), `src/pages/ProLogin.tsx` (redirect to dashboard)
- **Migration**: add `status` column + RLS policies on `agent_contact_requests`

### Implementation Order
1. Database migration (status column + RLS)
2. Create ProDashboard.tsx with all sections
3. Update App.tsx route + ProLogin redirect

