

# Fix Low-Contrast Select Dropdown Highlights

## Problem

The `SelectItem` component uses `focus:bg-accent focus:text-accent-foreground` for the highlighted/selected state. Since `--accent` is the brand magenta (`328 100% 39%`), the focused item gets a saturated pink background. While the main text turns white via `focus:text-accent-foreground`, nested elements like description text (`text-muted-foreground`) and icons (`text-muted-foreground`) don't inherit this override — they stay gray/dark and become nearly invisible against the pink.

This affects every `Select` dropdown across the app: PropertyTypeSelector, furnishing options, rental situation, etc.

## Fix

Change the `SelectItem` focus style from the intense brand accent to a soft, neutral highlight that keeps all text readable:

**`src/components/ui/select.tsx`** — line 108, change:
```
focus:bg-accent focus:text-accent-foreground
```
to:
```
focus:bg-muted focus:text-foreground
```

This uses the light gray muted background (`245 20% 95%`) with standard dark text, so all nested text (descriptions, icons) remains perfectly readable. The checkmark indicator already shows which item is selected, so a subtle highlight is sufficient.

**Additionally**, in `PropertyTypeSelector.tsx`, the icon inside the category selector uses `text-muted-foreground` which will now stay visible. No changes needed there.

## Scope

One line change in one file. Affects all `Select` dropdowns globally — consistent fix across sell, rent, buy, onboarding, and admin forms.

