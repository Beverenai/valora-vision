
# Fix Navbar Full-Width and Verify Hero Card Layout

## Problem

1. **Navbar border doesn't span full width**: The `<header>` has `max-w-[1400px] mx-auto` which constrains the entire element including the bottom border. The border line should go edge-to-edge across the viewport.

2. **Hero card appears narrow**: With the tailwind breakpoint fix already deployed, the hero card's `lg:max-w-[960px]` should be active at your 1064px viewport. If it still looks narrow, the card's width settings need adjusting for desktop.

## Changes

### 1. Fix Navbar to span full width (`src/components/Navbar.tsx`)

Wrap the navbar in a full-width outer container for the border, and keep the inner content constrained:

```tsx
<header className="w-full border-b-2 border-primary">
  <div className="max-w-[1400px] mx-auto flex items-center justify-between py-4 px-6 relative">
    {/* ... all existing content unchanged ... */}
  </div>
</header>
```

This makes the border span 100% width while content stays centered at max 1400px.

### 2. Widen the hero card for desktop (`src/components/ValuationTicketCard.tsx`)

The hero `outerMaxWidth` is `max-w-[360px] md:max-w-[720px] lg:max-w-[960px]`. On a 1064px screen with padding, 960px is nearly edge-to-edge but may still look tight. Adjust to use more available space:

```
hero: {
  outerMaxWidth: "max-w-[360px] md:max-w-[540px] lg:max-w-[680px] xl:max-w-[780px]",
}
```

This provides better proportions — the card shouldn't dominate the full width but should feel substantial on desktop without being cramped.

### 3. Verify Index.tsx hero wrapper

The hero section in `Index.tsx` (line 168) has `max-w-[1400px]` wrapper — this is fine as it constrains the content area. The hero `flex items-center justify-center` properly centers the card within it.

## Impact

- Navbar border will span the full viewport width on all screen sizes
- Hero card will be proportionally wider on desktop/tablet
- No changes to mobile layout
