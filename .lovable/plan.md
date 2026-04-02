

# Fix Typewriter Text Layout Shift

## Problem
The typewriter text changes length as it types/deletes, causing the page content below it to shift up and down.

## Solution
Reserve a fixed height for the `<h1>` element containing the `TypewriterText` so the layout stays stable regardless of text length.

## Change

| File | Change |
|------|--------|
| `src/pages/Index.tsx` (line 203) | Add `min-h-[2.5em]` to the `<h1>` className so it always reserves space for the tallest phrase (which wraps to ~2 lines on smaller screens). This prevents content below from jumping. |

The `min-h` approach is simplest — it reserves vertical space equal to roughly 2 lines of the heading text, which accommodates all the phrases at every breakpoint. No changes to the `TypewriterText` component itself.

