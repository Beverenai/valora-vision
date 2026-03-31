

## Plan: Fix BUY Toggle Clipping + Redesign Agent CTA

### Problem 1: Toggle disappears on bottom card in BUY mode
The main content section (line 271) uses `overflow-hidden` when map is not expanded. The buy input content (URL + badge + toggle + button) exceeds the visible area and the toggle gets clipped.

**Fix in `src/components/ValuationTicketCard.tsx`:**
- Line 271: Change `overflow-hidden` to `overflow-visible` when in buy input mode. The condition already exists for `mapExpanded` — extend it to also check `hasBuyInput`:
  ```
  mapExpanded || hasBuyInput ? "overflow-visible" : "overflow-hidden"
  ```
- This lets the buy input content flow naturally without clipping, while sell mode (with Google address input) retains overflow-hidden behavior when map isn't expanded.

### Problem 2: Agent CTA needs better design
Current: plain text link. Redesign as an elegant banner section.

**Replace in `src/pages/Index.tsx` (lines 758-763):**
```tsx
<section className="py-12 px-4">
  <div className="max-w-2xl mx-auto text-center">
    <div className="border border-border/60 rounded-2xl px-6 py-8 md:px-10 md:py-10 bg-card/50 backdrop-blur-sm">
      <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-3">
        For Professionals
      </p>
      <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2">
        Are you a real estate agent?
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        Join ValoraCasa and get qualified leads, a professional profile page, and AI-powered tools to grow your business.
      </p>
      <Link to="/pro">
        <Button className="rounded-full px-8">
          List Your Agency
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  </div>
</section>
```

Uses the standardized section label style, serif heading, and primary CTA button consistent with the rest of the site.

### Files Modified
- `src/components/ValuationTicketCard.tsx` — line 271: allow overflow-visible for buy input mode
- `src/pages/Index.tsx` — replace plain text link with designed banner section

