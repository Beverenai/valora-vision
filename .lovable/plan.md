

## Plan: Fix Mobile Overflow (No Horizontal Scroll)

### Problem
On mobile, content overflows horizontally causing a sideways scroll. The screenshot shows this on the home page with the valuation card / map verify step. There's no global `overflow-x: hidden` anywhere.

### Root Fix

**`src/index.css`** — Add `overflow-x: hidden` to `html` and `body`:

```css
html, body, #root {
  background-color: #FAFAF7;
  overflow-x: hidden;
}
```

This single global rule prevents any element from causing horizontal scroll on any page. It's the standard approach for mobile-first sites.

### Secondary: Navbar absolute mobile menu

**`src/components/Navbar.tsx`** — The mobile dropdown uses `absolute` with `left-0 right-0` which can cause layout issues. No width constraint issues here since it's within the viewport, but worth confirming it behaves after the global fix.

### Why this works
The overflow is caused by elements with negative margins, wide `absolute` positioned elements, or animation transforms that momentarily extend beyond viewport. Rather than hunting down each individual case across 15+ pages, `overflow-x: hidden` on `html`/`body` is the industry-standard fix that handles all cases at once.

### Files Modified
- `src/index.css` — add `overflow-x: hidden` (1 line change)

