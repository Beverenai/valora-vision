

## Fix: Address input icon overlap

**Problem**: The non-compact input has class `pl-12 pr-5` followed by `px-6` (line 210). Since `px-6` sets both `padding-left` and `padding-right`, it overrides `pl-12`, causing the placeholder text to start too far left — overlapping with or sitting under the SVG pin icon.

**Fix** (line 210 in `src/pages/Index.tsx`):
- Change `"py-5 px-6 text-lg"` → `"py-5 pr-6 text-lg"` so that `pl-12` from the shared classes is preserved, keeping the text clear of the icon.

One-line change, no other files affected.

