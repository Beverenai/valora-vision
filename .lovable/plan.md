

# Remove "Used Every Day" Section + Add FAQ

## Changes to `src/pages/Index.tsx`

### 1. Remove the floating agencies section (lines 258–286)
Delete the entire "FLOATING AGENCIES" `<section>` block and the `AGENCIES` data array (lines 17–25).

### 2. Add FAQ section before the Final CTA
Insert an FAQ accordion section (using the existing `Accordion` component from `@radix-ui/react-accordion`) between the testimonials and the final CTA. Include 4–5 questions:

- **"Why is this free?"** — Answer: ValoraCasa is 100% free for homeowners. We are funded by carefully vetted real estate professionals who pay to feature their brand on the platform. Every agent is reviewed and approved before joining, so you only see trusted, qualified professionals.
- **"How accurate is the valuation?"** — Based on real comparable data from current listings in your area.
- **"Is my data shared?"** — Your information is kept confidential and only shared with agents you choose to connect with.
- **"How do you choose which agents appear?"** — All agents are carefully vetted for local expertise, track record, and professionalism before being approved.

### 3. Add import
Add `Accordion, AccordionItem, AccordionTrigger, AccordionContent` import from `@/components/ui/accordion`.

## Files

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove AGENCIES data + floating section; add FAQ accordion section with "Why is this free?" as first item |

