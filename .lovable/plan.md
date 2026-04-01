

# Fix Desktop Layout: Navbar, Card Sizing, and Footer

## Root Cause

The `tailwind.config.ts` has custom `screens` defined at the **top level** of `theme` (not inside `extend`), which **completely replaces** all default Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`). This means every `md:`, `lg:`, `xl:` class across the entire codebase is broken and has no effect. Only `xs:` and `tablet:` exist.

## Plan

### 1. Fix Tailwind breakpoints in `tailwind.config.ts`

Move the custom `screens` (`xs`, `tablet`) from `theme.screens` into `theme.extend.screens` so the default Tailwind breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`) are preserved alongside custom ones.

**Before:**
```ts
theme: {
  screens: {
    'xs': '400px',
    'tablet': '900px',
  },
  extend: { ... }
}
```

**After:**
```ts
theme: {
  extend: {
    screens: {
      'xs': '400px',
      'tablet': '900px',
    },
    ...
  }
}
```

### 2. Fix Footer for desktop layout (already has `md:grid-cols-4`)

The footer already uses `md:grid-cols-4` which will work once breakpoints are restored. No changes needed.

### 3. Fix Navbar desktop nav (already uses `md:flex` / `md:hidden`)

The navbar already has `hidden md:flex` for desktop nav and `md:hidden` for hamburger. Will work once breakpoints are restored. No changes needed.

### 4. Verify ValuationTicketCard sizing

The hero card uses `max-w-[360px] md:max-w-[720px] lg:max-w-[960px]` which will properly expand on desktop once breakpoints are restored.

### 5. Remove App.css cruft

The `App.css` has a `#root { max-width: 1280px }` leftover from the Vite template that constrains the root container. Remove it to let the full-width layout work properly.

## Impact

This is a one-line config fix (+ App.css cleanup) that will immediately fix the desktop layout across **every page** in the app, since all `md:`, `lg:`, `xl:` responsive classes will start working.

