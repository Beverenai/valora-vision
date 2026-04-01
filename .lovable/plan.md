

# Agent Login Flow + Dashboard Feature Improvements

## Overview

Add a "Login" link for agents in the Navbar and ProLanding page, protect the dashboard route with an auth guard, add logout, and improve the dashboard's profile editing, leads management, and subscription sections.

## Changes

### 1. Add "Agent Login" link to Navbar and ProLanding

**Navbar** (`src/components/Navbar.tsx`):
- When on `/pro` or `/pro/*` routes, show a "Login" link in the nav that goes to `/pro/login`
- Detect `/pro` context and add login link to `permanentLinks` or conditionally render it

**ProLanding** (`src/pages/ProLanding.tsx`):
- Add a "Sign in" link in the hero area next to "Get Started Free" (or in the top section)
- Add login link to the final CTA section as well

### 2. Auth guard + Logout (`src/pages/ProDashboard.tsx`)

- The dashboard already redirects to `/pro` if no session exists — this is the auth guard
- Add a **Logout** button in the sidebar footer and mobile header
- On logout, call `supabase.auth.signOut()` and navigate to `/pro/login`
- Add a "Sign out" nav item in the Account group or as a footer action

### 3. Profile editing improvements (`src/pages/ProDashboard.tsx` — `ProfileSection`)

Current state: basic text fields (name, tagline, description, phone, website, address, socials).

Add:
- **Logo upload**: Show current logo with an "Upload" button. Use Supabase Storage bucket for agent logos. Display preview of uploaded image.
- **Languages editor**: Multi-select chips for languages (English, Spanish, etc.) from the existing `languages` column
- **Service zones display**: Show current zones as read-only badges (zones require admin assignment per business model)

### 4. Leads management improvements (`src/pages/ProDashboard.tsx` — `LeadsSection`)

Current state: filter by status, expand for details, export CSV, mark as contacted/converted.

Add:
- **Property address** in lead details — pull from the `interest` field or related data
- **Quick reply via email link**: `mailto:` link with pre-filled subject when expanding a lead
- **"Archive"** status option alongside contacted/converted
- **Sort options**: by date (newest/oldest) toggle

### 5. Subscription section (`src/pages/ProDashboard.tsx` — `SubscriptionSection`)

Current state: placeholder text only.

Replace with:
- Show current plan status (Free tier by default since no billing is connected yet)
- Display the 3 tier cards (Basic/Premium/Elite) from ProLanding with a "Current Plan" badge on the active one
- "Upgrade" buttons that link to `/pro` pricing section or trigger a contact/interest flow
- Note: actual Stripe billing can be added later; for now show plan info and upgrade interest

### Files Modified

- `src/components/Navbar.tsx` — add Login link when on /pro routes
- `src/pages/ProLanding.tsx` — add Sign in links
- `src/pages/ProDashboard.tsx` — logout button, profile improvements (logo upload, languages, zones), leads improvements (mailto, archive, sort), subscription section with tier display

### Database

- Create a Supabase Storage bucket `agent-logos` for logo uploads (if not already existing)
- No schema changes needed — all columns already exist

