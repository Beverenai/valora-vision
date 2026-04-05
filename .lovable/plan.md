

# Fix Build Error + Replace Agent Matching Placeholder Faces

## 1. Fix dependency version mismatch (critical — site is down)

**File**: `package.json`

The `@tanstack/react-query` is at `^5.83.0` but `@tanstack/query-sync-storage-persister` and `@tanstack/react-query-persist-client` are at `^5.96.0`, which requires `@tanstack/query-core@5.96.2` that doesn't resolve. Fix by bumping `@tanstack/react-query` to `^5.96.0` to match.

## 2. Replace placeholder initials with face images in Agent Matching

**File**: `src/pages/Index.tsx`

Two locations show placeholder avatar circles:

**Step 4 "How it works" timeline (lines 448-475)**: Currently shows circles with "EV", "SP", "DM" initials. Replace with `<img>` tags using royalty-free avatar placeholder images (e.g., `https://randomuser.me/api/portraits/` or use inline SVG silhouettes) to look like real agent photos.

**Bento grid Card 6 (lines 668-677)**: Currently shows Users icons in circles. Replace with the same avatar images for consistency.

Both will use small circular images with `object-cover rounded-full` styling to look like real agent headshots.

