

## Plan: Remove sticky CTA + Green theme for Rent mode

### Changes in `src/pages/Index.tsx`

**1. Remove the sticky mobile CTA (lines 571-595)**
- Delete the entire `AnimatePresence` block for the sticky bottom CTA
- Remove the `showStickyCta` state and the `IntersectionObserver` effect (lines 111, 130-138) since they're no longer needed

**2. Switch all accent colors to green when in Rent mode**

Every place that uses `text-primary`, `bg-primary`, `bg-[hsl(var(--terracotta-light))]` etc. needs a conditional class based on `isSell`. Affected spots:

- **Report features section** — accent circle background (line 416): switch to `bg-[hsl(var(--rent-light))]` for rent
- **Report features section** — sparkle icon color (line 419): switch to `text-[hsl(var(--rent-foreground))]` for rent  
- **Report features section** — title hover color (line 422): switch to green on hover for rent
- **"All included" pill** (line 441): switch bg and text to rent green
- **Testimonial stars** (line 496): switch `fill-primary text-primary` to green
- **Testimonial dots** (line 515): switch `bg-primary` to green for active dot
- **Final CTA gradient** (line 528): switch from terracotta-light to rent-light gradient
- **Sticky CTA button** — removed entirely

I'll create a helper at the top of the component to simplify this:
```tsx
const accentBg = isSell ? "bg-primary" : "bg-[hsl(var(--rent))]";
const accentText = isSell ? "text-primary" : "text-[hsl(var(--rent-foreground))]";
const accentLightBg = isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--rent-light))]";
```

### File
- `src/pages/Index.tsx`

