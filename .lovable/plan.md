

# ValoraCasa Full Design Redesign — EasyPark + WizzAir Inspired

## Summary
Complete visual overhaul of the entire application: new color palette (deep indigo + magenta), unified Inter typography with light hero headings, 10px border-radius buttons, alternating white/lavender sections, dark hero/footer/stats, and updated component styling across all pages.

## Scope
This touches **every visual layer** of the app. The approach is foundation-first (CSS variables, Tailwind config, shared components), then page-by-page updates.

---

## 1. Foundation: CSS Variables + Tailwind Config

### `src/index.css`
- Replace all CSS custom properties with the new palette:
  - `--primary` → magenta `#C6007E` (HSL ~328 100% 39%)
  - `--background` → `#FFFFFF`, `--background-alt` → `#F5F4F9`
  - `--foreground` → `#343434`, headings → `#242224`
  - Add `--brand` (deep indigo `#06038D`), `--brand-light` (`#872879`)
  - Add `--primary-light` (`#FF52A3`), `--primary-hover` (`#A80068`)
  - Update `--muted-foreground` → `#767676`
  - Update success/warning/danger to match spec
- Change `--radius` from `0.75rem` to `10px`
- Remove Playfair Display, DM Serif Display, Plus Jakarta Sans font imports — use only Inter
- Remove `font-family` heading override (everything is Inter now)
- Set `html, body` bg to `#FFFFFF`

### `tailwind.config.ts`
- Remove `font-heading`, `font-serif`, `font-ticket-cursive` families — keep only `font-sans: ['Inter']`
- Add colors: `brand`, `brand-light`, `primary-light`, `primary-hover`
- Add gradient utilities or keep inline
- Update `--radius` to `10px`

---

## 2. Shared UI Components

### `src/components/ui/button.tsx`
- Default border-radius → `rounded-[10px]` (not pill)
- Primary variant: magenta bg, white text, hover with translateY(-1px) + shadow
- Secondary variant: transparent, indigo border, hover fills indigo
- Ghost-dark variant: transparent, white border, for dark sections
- Accent variant: hot pink `#FF52A3`

### `src/components/ui/SectionLabel.tsx`
- Add magenta line (40px wide, 2px tall) above the label text
- Label: 12px uppercase, letter-spacing 3px, muted color

### `src/components/ui/card.tsx`
- `rounded-xl` (12px), subtle border `rgba(0,0,0,0.06)`, shadow `0 1px 3px rgba(0,0,0,0.06)`
- Hover: `translateY(-2px)` + stronger shadow

### `src/components/StatCard.tsx`
- Redesign for dark background: white text, large 36px bold numbers, muted white labels

---

## 3. Navbar (`src/components/Navbar.tsx`)
- Dark background `#06038D` (brand indigo), white text, 64px height
- Logo: white text, gold accent on "Casa"
- Nav items: centered, white, hover opacity
- CTA button: magenta `#C6007E` bg, `rounded-[10px]`
- Mobile: hamburger opens dark slide-in panel with large touch targets
- Scroll behavior: transparent on hero → solid indigo on scroll (add scroll listener)

---

## 4. Footer (`src/components/Footer.tsx`)
- Dark background `#0A0670`
- 4-column grid: Logo+desc+social, For Homeowners, For Agents, Company
- Text: `rgba(255,255,255,0.6)`, links white on hover
- Bottom bar: `© 2026 ValoraCasa · Made in Marbella`

---

## 5. Landing Page (`src/pages/Index.tsx`)

### Hero
- Full-width dark gradient bg (`#06038D → #872879`)
- H1: 52-58px, font-weight 400 (light!), white — NOT bold, NOT serif
- Subtitle: 18-20px, `rgba(255,255,255,0.7)`
- Remove Playfair/DM Serif references
- Address search field embedded in hero (already exists via ValuationTicketCard)
- Two CTA buttons side by side: primary magenta + ghost-dark outline

### Stats Bar
- Dark bg `#06038D`, white text
- Large numbers (36px bold), muted white labels
- Show: "2,400+ Valuations", "150+ Verified Agents", "€2.1B Assessed", "Costa del Sol Coverage"

### How It Works
- White bg section
- 4-column layout desktop (add step 4: "Connect with top agents")
- Large numbered steps with magenta accent numbers (48px, 700 weight, 0.3 opacity)
- Icons 40x40, muted

### Service Grid (new section replacing "Report Features")
- Light lavender bg `#F5F4F9`
- 3-column grid of white cards with icons, titles, descriptions
- Hover: `translateY(-2px)` + shadow
- 6 services: Free Valuation, Comparable Sales, AI Analysis, Agent Matching, Rental Estimate, Market Trends

### Recent Valuations
- Horizontal scrollable cards with snap (WizzAir deal-card style)
- Property image, location, price, "Valued X days ago" badge
- `min-width: 280px`, `border-radius: 12px`

### Floating Agencies
- Keep but update font to Inter (remove DM Serif Display italic)

### Testimonials
- White bg, keep structure but update typography to Inter

### CTA Banner
- Dark gradient section: "Ready to find out what your property is worth?"
- Two buttons: primary magenta + ghost-dark

### Section alternation
- White → lavender → white → dark → white → lavender pattern
- Remove `<SectionDivider />` lines — use background color changes instead

---

## 6. Valuation Wizards (`SellValuation.tsx`, `RentValuation.tsx`)
- Update step indicator to numbered (not dots)
- Buttons: `rounded-[10px]`, magenta primary
- Google Address field: larger, with MapPin icon
- Keep ticket concept, update colors/radius

## 7. Result Pages (`SellResult.tsx`, `RentResult.tsx`, `BuyResult.tsx`)
- Ticket card: wider padding (32px), large price (40px, 700), confidence badge
- Alternating white/lavender section backgrounds
- Section labels with magenta line
- Agent cards: vertical layout, round avatar, star rating, language pills, magenta CTA

## 8. Agent Pages (`AgentProfile.tsx`, `AgentDirectory.tsx`)
- Cover photo with indigo overlay gradient
- Agent cards: `rounded-xl`, hover lift+shadow
- Contact form: magenta submit button

## 9. Pro Pages (`ProLanding.tsx`, `ProLogin.tsx`, `ProDashboard.tsx`, `ProOnboard.tsx`)
- ProLanding: pricing cards (3-col, "Most Popular" badge on middle)
- Update all buttons/inputs to new radius and colors
- Dashboard: keep functional structure, update accent colors

## 10. `ValuationTicketCard.tsx`
- Update border-radius to 16px
- Wider padding 32px
- Price: 40px, weight 700
- Confidence badge: pill with color (green/gold/red)
- Reference code: monospace, copyable, subtle bg
- Update accent colors from terracotta to magenta for sell mode

---

## 11. Animations
- Scroll-triggered fade-in via IntersectionObserver (already using framer-motion — keep)
- Card hover: `translateY(-4px)` + shadow — NO scale/rotate
- Stats number count-up animation
- Step progress bar smooth width transition

## 12. Mobile-Specific
- Touch targets min 44x44px
- Horizontal scroll with `scroll-snap-type: x mandatory`
- Sticky CTA bottom on result pages
- Font scaling with `clamp()`
- Contact modal as bottom sheet on mobile

---

## Files Modified (all)
- `src/index.css` — complete variable overhaul
- `tailwind.config.ts` — colors, fonts, radius
- `src/components/Navbar.tsx` — dark nav, scroll behavior
- `src/components/Footer.tsx` — dark footer, 4-col layout
- `src/components/ui/button.tsx` — new variants, 10px radius
- `src/components/ui/SectionLabel.tsx` — magenta line accent
- `src/components/ui/card.tsx` — hover effects
- `src/components/StatCard.tsx` — dark bg style
- `src/components/ValuationTicketCard.tsx` — new colors/radius/pricing display
- `src/components/PropertyShowcaseCarousel.tsx` — horizontal snap scroll
- `src/components/CTABanner.tsx` — dark gradient
- `src/components/CrossSellBanner.tsx` — updated colors
- `src/components/InlineCTA.tsx` — updated colors
- `src/components/TestimonialCard.tsx` — updated typography
- `src/pages/Index.tsx` — full hero/sections redesign
- `src/pages/SellValuation.tsx` — wizard styling
- `src/pages/RentValuation.tsx` — wizard styling
- `src/pages/SellResult.tsx` — section backgrounds, agent cards
- `src/pages/RentResult.tsx` — section backgrounds
- `src/pages/BuyResult.tsx` — section backgrounds
- `src/pages/BuyAnalysis.tsx` — updated styling
- `src/pages/AgentProfile.tsx` — cover overlay, card styling
- `src/pages/AgentDirectory.tsx` — card styling
- `src/pages/ProLanding.tsx` — pricing cards
- `src/pages/ProLogin.tsx` — updated colors
- `src/pages/ProDashboard.tsx` — accent colors
- `src/pages/ProOnboard.tsx` — wizard styling
- `src/components/shared/ProgressIndicator.tsx` — numbered steps
- `src/components/shared/StepNavigation.tsx` — button styling

