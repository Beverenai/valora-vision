

# Scale Sales Portfolio for 100-300+ Sales

## Problem
The current SalesSection renders ALL sales as a flat card grid with no pagination, filtering, or inline editing. At 100+ sales this becomes unusable — slow rendering, no way to find a specific sale, and editing requires deleting and re-adding.

## Plan

### 1. Table View with Pagination (default for 10+ sales)
Replace the card grid with a **sortable data table** when sales count exceeds ~10. Show columns: photo thumbnail, type, city, price, date, beds, size, verified status, and actions. Include:
- **Pagination** (25 per page) using existing `Pagination` component
- **Search/filter bar**: text search across city/address/type, filter by year, filter by verified status
- **Toggle**: grid view (cards) vs table view, remembering preference
- Keep the card grid as an option for agents who prefer visual browsing

### 2. Inline Edit via Sheet/Dialog
Add an **Edit** button (pencil icon) on each sale row/card. Opens a `Sheet` (slide-in panel) pre-populated with all sale fields — same form as the manual AddSaleDialog but in edit mode. Fields: property type, beds, baths, size, city, address, price, date, show_price toggle, photo, team member attribution. Saves via `supabase.update()`.

### 3. Bulk Actions
Add a checkbox column in table view. When items are selected, show a floating action bar with:
- **Bulk delete** (with confirmation)
- **Assign to team member** (dropdown)
- Select all / deselect all

### 4. Stats Stay Compact
The stats cards and milestones section remain at the top (unchanged). They already compute from the full `sales` array which will now be fetched with pagination metadata.

### 5. Server-Side Pagination
Switch from fetching ALL sales to paginated fetches:
- `supabase.from("agent_sales").select("*", { count: "exact" })` with `.range(from, to)`
- Stats (total, verified, last12, avgDays) computed via a separate lightweight query or kept from the full count
- Search filter applied via `.ilike("city", "%term%")` or `.or(...)` clauses

## Files to Change

| File | Change |
|------|--------|
| `src/components/dashboard/SalesSection.tsx` | Major rewrite: add table view, pagination, search/filter, view toggle, bulk actions, edit trigger |
| `src/components/dashboard/EditSaleSheet.tsx` | **New** — Sheet component with edit form, pre-populated fields, save/cancel |
| `src/components/dashboard/AddSaleDialog.tsx` | Minor — share form field components with EditSaleSheet |

## Technical Details
- Table uses Shadcn `Table` component with sticky header
- Pagination uses `select("*", { count: "exact" })` + `.range()` for true server-side paging
- Search debounced (300ms) before triggering re-fetch
- Edit sheet uses `supabase.from("agent_sales").update({...}).eq("id", saleId)`
- Enriching sales (skeleton cards) still shown at the top of the list regardless of view mode
- Polling logic preserved for enriching sales

