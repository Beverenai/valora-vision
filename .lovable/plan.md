

## Plan: Fix Card Back Face, Mobile Optimization, Agency Copy Update

### Issues from Screenshot
1. **Card back face broken**: Front-face elements (barcode, accent circles, large text) are bleeding through onto the back face. The `backface-visibility: hidden` isn't working properly because the accent circles and barcode from the front overlap visually.
2. **Agency section copy wrong**: Says "Trusted by leading agencies" — should say "Used every day by real estate professionals"
3. **Mobile card too narrow**: On 390px viewport the card is cramped

### Changes

**1. `src/components/ValuationTicketCard.tsx` — Fix card rendering**

- **Back face z-index**: Add `z-10` to back face so it properly covers front face when flipped
- **Front face accent circles**: These use absolute positioning that extends outside the card bounds (`left: -16px`, `right: -8px`). Add `overflow-hidden` to the image container so circles don't bleed outside
- **Mobile sizing**: Change `max-w-[320px]` to `max-w-[340px]` on mobile for better use of 390px screen. Reduce internal padding on mobile from `p-4` to `p-3`
- **Back face detail grid**: Increase spacing, make items larger on mobile — `gap-2.5` to `gap-3`, larger icon size, bigger text
- **Remove stub on mobile**: The `hidden sm:flex` stub is fine but ensure card uses full width without it

**2. `src/pages/Index.tsx` — Copy + mobile fixes**

- Line 154: Change `"Trusted by leading agencies"` → `"Used every day by real estate professionals"`
- **Hero section mobile**: Reduce `px-6` to `px-4` on mobile, tighten heading size for 390px
- **Floating agencies on mobile**: The `h-[180px]` container with absolute-positioned names is problematic on small screens — names overlap. Reduce to `h-[120px]` on mobile with fewer visible names or adjusted positions
- **"What you get" section**: The flippable card showcase section — ensure adequate padding on mobile

**3. Overall mobile polish**

- Reduce `py-20` sections to `py-14` on mobile for less dead space
- Ensure text sizes scale: `text-3xl` headings on mobile (not `text-4xl`)
- Sticky CTA: already good, keep as-is

