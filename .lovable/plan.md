

## Plan: Remove sell/rent buttons + Showcase ValuationTicketCard on landing page

### Changes

**1. `src/pages/Index.tsx` — Hero & showcase updates**

- **Remove** the "I want to sell" / "I want to rent out" buttons from `AddressBlock`
- **Replace** with a single terracotta CTA: "Get Your Free Valuation" that navigates to `/sell/valuation` (default flow)
- **Add a new showcase section** after the Hero (before "Trusted By") that displays the `ValuationTicketCard` with sample data — e.g. address "Calle Sierra Blanca 12, Marbella", estimated value "€1,250,000", property type "Villa". This gives visitors a preview of what they'll receive
- Import `ValuationTicketCard` component
- Remove `valuationType` state since we no longer need sell/rent toggle
- Update the Final CTA section (section 7) to also use a single button instead of the dual sell/rent buttons
- Update sticky mobile CTA to just navigate to `/sell/valuation`

**2. `src/components/ValuationTicketCard.tsx` — Light theme + remove AI**

- Change `"VALUATION BY AI"` → `"VALUATION REPORT"` (line 160)
- Update colors to match light editorial palette:
  - `bg-muted` → `bg-[#E8E5E0]` (warm light gray, matching the reference HTML's `#E2E2E2`)
  - `text-foreground` → `text-[#1A1A1A]`
  - `bg-primary` hero area → `bg-[#1A1A1A]` (dark image area like reference)
  - Accent circles use terracotta `bg-[#D4713B]` instead of gold/teal tokens
  - Barcode uses `#D4713B` for sell, `#4CAF50` for rent
  - `border-foreground/20` dashed border → `border-[#1A1A1A]/20`
- Keep the same layout structure (9:16 aspect ratio, stub section, SVG backdrop, dots divider, barcode)

**3. Fonts** — The ticket uses `Italianno` (cursive) and `Plus Jakarta Sans` (heading) which are already in `tailwind.config.ts` but not imported. Add Google Fonts import for `Italianno` and `Plus Jakarta Sans` to `src/index.css`.

### Section flow on landing page after changes
1. Hero (address input + single CTA)
2. **NEW: Ticket showcase** — centered ValuationTicketCard with sample data, subtle caption like "See what you'll get"
3. Trusted By
4. How It Works
5. Report Features
6. Recent Valuations
7. Testimonials
8. Final CTA

