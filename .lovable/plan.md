

## Plan: Add Empty State Fallback for Matched Agents Section

### Current State
The implementation is already complete — the `match_agents_by_location` RPC exists and works, agent cards are real (not hardcoded), and the contact modal is functional. The only issue is that when no agents are found (line 682), the section returns `null` — silently hiding itself.

### Change

**`src/pages/SellResult.tsx` — line 682**

Replace `if (agents.length === 0) return null;` with a fallback empty state:

```tsx
if (agents.length === 0) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <div className="w-10 h-px bg-gold mx-auto mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3">
          Recommended Local Experts
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Local agents coming soon. Want to be featured here?
        </p>
        <Link to="/pro">
          <Button variant="outline" className="rounded-full">
            Join as an Agent
          </Button>
        </Link>
      </div>
    </section>
  );
}
```

### Files Modified
- `src/pages/SellResult.tsx` — replace empty-state `return null` with CTA fallback

