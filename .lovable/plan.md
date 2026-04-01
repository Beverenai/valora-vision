

# Move Team & Company to Sidebar Navigation

## What Changes
Replace the tabbed Profile section with 3 separate sidebar navigation items. Instead of Profile → Tabs(My Profile, Team, Company), we get three top-level sections in the sidebar.

## Changes in `src/pages/ProDashboard.tsx`

### 1. Update Section type
```typescript
type Section = "overview" | "profile" | "team" | "company" | "leads" | "zones" | "reviews" | "analytics" | "subscription" | "settings";
```

### 2. Update navGroups
Add "Team" and "Company" to the Main group (using `Users` and `Building2` icons), rename "My Profile" to keep it personal:
```
Main: Dashboard, My Profile, Team, Company Profile
Business: Leads, My Zones, Reviews, Performance
Account: Subscription, Settings
```

### 3. Remove `ProfileSection` wrapper with Tabs
- `MyProfileTab` renders directly when `section === "profile"`
- `TeamTab` renders when `section === "team"`
- `CompanyProfileTab` renders when `section === "company"`
- The `isAdmin` check moves to the page-level rendering logic
- Delete the `ProfileSection` function entirely

### 4. Update MobileDropdownNav
Add the two new sections to the mobile dropdown as well.

### 5. Update badges type
Extend the badges `Partial<Record<Section, number>>` — team could show member count.

## Files Modified
- `src/pages/ProDashboard.tsx` — restructure nav and rendering

