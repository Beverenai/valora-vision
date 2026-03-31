

## Plan: Design Consistency Standardization

### Summary
Standardize fonts, section labels, card radii, and color usage across the codebase to match the design guidelines.

---

### 1. Font Strategy: Mixed Serif + Sans-Serif

**Current state**: All headings use `font-heading` (Plus Jakarta Sans) or `font-sans` (Inter). Playfair Display is loaded but only used for italic accent words like "really" and "worth the price".

**Change**: Use Playfair Display for major section titles (hero headings, section h2s on Index, result page section headers). Keep Plus Jakarta Sans for sub-headings, form titles, dashboard headers, and UI chrome.

**Add to Tailwind config**:
```ts
fontFamily: {
  serif: ["'Playfair Display'", "serif"],  // NEW
  // keep existing sans, heading, ticket-cursive
}
```

**Pages affected**:
- `Index.tsx`: Hero `h1` and section `h2`s → `font-serif` instead of `font-sans`
- `SellResult.tsx` / `RentResult.tsx` / `BuyResult.tsx`: Major section headers → `font-serif`
- `ProLanding.tsx`: Hero headline → `font-serif`, inner section h2s keep `font-heading`
- `AgentProfile.tsx`: Company name h1 → `font-serif`
- `AgentDirectory.tsx`: Page title → `font-serif`

### 2. Standardize Section Labels

**Current state**: Two patterns exist:
- `tracking-[0.15em]` (Footer, CompanyLogos, CrossSell, AboutValuator, StatCard, some SellResult cells)
- `tracking-[0.2em]` (SectionLabel on Index, BuyResult sections, some SellResult sections)

**Change**: Standardize ALL section labels to: `text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground`

This means:
- Update `SectionLabel` in `Index.tsx` from `tracking-[0.2em]` → `tracking-[0.15em]`
- Update all `tracking-[0.2em]` instances in `BuyResult.tsx` and `SellResult.tsx` → `tracking-[0.15em]`
- Normalize size variations (`text-[0.55rem]`, `text-[0.6rem]`) to `text-[0.65rem]` for primary labels; keep `text-[0.55rem]` only for secondary/stat labels

### 3. Card Border Radius → 12px (`rounded-xl`)

**Current state**: Mix of `rounded-lg` (8px via --radius), `rounded-xl` (16px), `rounded-2xl` (20px).

**Change**: Update the Card component default from `rounded-lg` to `rounded-xl` for 12px consistency. Update explicit `rounded-2xl` on feature cards in Index.tsx to `rounded-xl`.

**File**: `src/components/ui/card.tsx` — change `rounded-lg` → `rounded-xl`

### 4. Hardcoded Color Cleanup

Replace the two hardcoded terracotta hex values with the CSS variable:
- `ProOnboard.tsx` line 532: `bg-[#D4713B]` → `bg-primary`
- `CardRevealWrapper.tsx` line 102: `bg-[#D4742B]` → `bg-primary` (this is also slightly wrong — #D4742B vs #D4713B)

### 5. Background Color Note

Current: `#FAFAF7` — close enough to the specified `#FAF8F5`. No change needed (the warm off-white is consistent).

---

### Files Modified
- `tailwind.config.ts` — add `serif` font family
- `src/components/ui/card.tsx` — `rounded-lg` → `rounded-xl`
- `src/pages/Index.tsx` — serif headings + fix SectionLabel tracking
- `src/pages/SellResult.tsx` — serif section headers + normalize tracking
- `src/pages/RentResult.tsx` — serif section headers
- `src/pages/BuyResult.tsx` — serif section headers + normalize tracking
- `src/pages/ProLanding.tsx` — serif hero heading
- `src/pages/AgentProfile.tsx` — serif company name
- `src/pages/AgentDirectory.tsx` — serif page title
- `src/pages/ProOnboard.tsx` — fix hardcoded color
- `src/components/shared/CardRevealWrapper.tsx` — fix hardcoded color

