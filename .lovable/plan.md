

## Plan: Mobile Responsiveness Polish

After reviewing all five pages, most already use responsive Tailwind classes (`grid-cols-1 md:grid-cols-*`, mobile tab bar, etc.). Here are the specific fixes needed:

### 1. `/pro` Landing — Pricing cards (already responsive)
**No fix needed.** Line 156 uses `grid md:grid-cols-3 gap-6` which stacks on mobile. Verified.

### 2. `/pro/onboard` — Step 1 form + Step 2 animation
**No fix needed.** Form fields use `grid-cols-1 sm:grid-cols-2` (line 393) so they go full-width on mobile. Step 2 animation is centered via `text-center` + `max-w-sm mx-auto` (lines 471, 475). Verified.

### 3. `/agentes/:slug` — Contact form + stats bar
**Minor fix needed in `src/pages/AgentProfile.tsx`:**
- **Stats bar** (line 330): Already has `overflow-x-auto` with `shrink-0` items — works fine.
- **Contact form** (line 538): On mobile (`isMobile`), the contact form renders in the grid without the `sticky` class — correct. However, the 2-column grid `grid-cols-1 md:grid-cols-[1fr_340px]` (line 371) already stacks on mobile, placing the form below content. This works.
- **Hero buttons** (line 309): The "Contact" and "Website" buttons don't wrap well on small screens. Change `flex gap-3` to `flex flex-wrap gap-3` to prevent overflow.

### 4. `/agentes` Directory — Card grid
**No fix needed.** Line uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — single column on mobile. Verified.

### 5. `/pro/dashboard` — Bottom tab bar
**No fix needed.** Already implemented: `isMobile` check (line 568) renders `MobileTabBar` with `fixed bottom-0` tab bar showing 4 items, and hides the sidebar. Content has `pb-20` to avoid overlap.

---

### Summary of Changes

**File: `src/pages/AgentProfile.tsx` — Line 309**
- Change `<div className="flex gap-3 shrink-0">` to `<div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">`
- This prevents the hero CTA buttons from overflowing on narrow screens

That's the only fix needed. All other pages already handle mobile correctly.

### Files Modified
- `src/pages/AgentProfile.tsx` (1 line change)

