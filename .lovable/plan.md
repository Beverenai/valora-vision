

# Fix Low-Contrast Admin Controls (Dark Mode)

## Problem

All inputs, select triggers, and buttons on the admin panel use `bg-white/5 border-white/10` — that's 5% white background with 10% white border on a near-black background. Nearly invisible. The refresh button uses `text-white/60` which is also too dim.

## Fix

Increase opacity levels across all admin dark-mode controls in `src/pages/Admin.tsx`:

| Current | Replacement | Element |
|---------|-------------|---------|
| `bg-white/5 border-white/10` | `bg-white/10 border-white/20` | Inputs, SelectTriggers, form fields |
| `placeholder:text-white/30` | `placeholder:text-white/50` | Input placeholders |
| `text-white/60` | `text-white/80` | Refresh button text |
| `text-white/30` (search icon) | `text-white/50` | Search icon |
| `text-white/40` (count text) | `text-white/60` | "6 valuations" counter |

This is a bulk find-and-replace across the file — roughly 57 occurrences of `bg-white/5 border-white/10` become `bg-white/10 border-white/20`, and similar for the other opacity values.

## Files to change

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Increase all dark-mode opacity values for inputs, selects, buttons, icons, and helper text |

No database or component changes needed — the issue is purely opacity values in inline class strings.

