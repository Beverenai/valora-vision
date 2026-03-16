

## Plan: Apply La Sala Editorial Design Language to Homepage

### What changes

Transform `src/pages/Index.tsx` from its current editorial-lite style to the full La Sala design language — bold uppercase sans-serif headlines, italic serif subtitles, drop caps, thin hr dividers, small tracking-widest labels, and the specific color/typography system.

### Section-by-section changes

**1. Hero** (lines 128-158)
- Replace badge with small uppercase label: `"YOUR PROPERTY VALUATION"` — `text-xs tracking-[0.2em] uppercase text-[#999]`
- Add thin `<hr>` divider below label (`max-w-[60px] mx-auto border-[#E8E5E0] my-6`)
- Headline becomes bold uppercase sans-serif: `font-black uppercase tracking-tight text-5xl md:text-7xl text-[#1A1A1A]` (Inter, not DM Serif)
- Subtitle becomes italic DM Serif: `font-['DM_Serif_Display'] italic text-xl md:text-2xl text-[#777]`
- Keep the ValuationTicketCard as-is

**2. Stats Bar** (lines 50-72)
- Restyle to match La Sala: small uppercase tracking labels `text-xs tracking-[0.2em] uppercase text-[#999]`, large bold numbers `text-3xl md:text-4xl font-extrabold text-[#1A1A1A]`
- Use thin `border-[#E8E5E0]` dividers

**3. SectionDivider** (line 46-48)
- Change to thin 1px `<hr>` with `border-[#E8E5E0]` instead of `border-border/40`

**4. Floating Agencies** (lines 169-197)
- Label becomes: `text-xs tracking-[0.2em] uppercase text-[#999]`

**5. How It Works** (lines 201-247)
- Small label above: `"HOW IT WORKS"` — `text-xs tracking-[0.2em] uppercase text-[#999] text-center`
- Headline: bold uppercase sans-serif `font-black uppercase tracking-tight text-4xl md:text-6xl text-[#1A1A1A] text-center`
- Italic subtitle below: `font-['DM_Serif_Display'] italic text-xl text-[#777] text-center`
- Step numbers stay large but use `font-extrabold text-[#E8E5E0]` for a watermark feel
- Step dividers use `border-[#E8E5E0]`

**6. What You Get / Flippable Card** (lines 251-293)
- Small label: `"YOUR REPORT"` — tracking-widest uppercase
- Headline: bold uppercase sans-serif
- Italic subtitle

**7. Report Features** (lines 297-362)
- Small label: `"INCLUDED FREE"` — tracking-widest uppercase
- Headline: bold uppercase sans-serif `font-black uppercase tracking-tight`
- Italic subtitle below
- Feature dividers use `border-[#E8E5E0]`

**8. Recent Valuations** (lines 366-390)
- Small label + bold uppercase headline pattern

**9. Testimonials** (lines 394-437)
- Small label: `"TESTIMONIALS"` — tracking-widest uppercase
- Headline: bold uppercase sans-serif
- Quote text stays italic DM Serif

**10. Final CTA** (lines 441-471)
- Same La Sala treatment: small label, bold uppercase headline, italic subtitle
- Remove rounded-full badge, use thin hr + label pattern

### Typography pattern (applied consistently everywhere)

```text
<p class="text-xs tracking-[0.2em] uppercase text-[#999]">SMALL LABEL</p>
<hr class="max-w-[60px] mx-auto border-[#E8E5E0] my-6" />  (optional)
<h2 class="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#1A1A1A]">HEADLINE</h2>
<p class="font-['DM_Serif_Display'] italic text-xl text-[#777] mt-4">Italic subtitle</p>
```

### Files to edit
- `src/pages/Index.tsx` — full typography/styling overhaul, no structural changes to layout or components

