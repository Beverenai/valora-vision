

## Plan: Bold Hero Gradient

### Change

**`src/pages/Index.tsx`** — Update the hero gradient from 6% opacity to ~20%, and use a two-stop terracotta-to-peach gradient for SELL, and a matching blue-to-teal gradient for BUY.

Current (line 172-174):
```
'linear-gradient(180deg, hsl(21 62% 53% / 0.06) 0%, transparent 60%)'
```

New SELL gradient:
```
'linear-gradient(180deg, hsl(21 62% 53% / 0.18) 0%, hsl(30 80% 80% / 0.10) 50%, transparent 85%)'
```

New BUY gradient:
```
'linear-gradient(180deg, hsl(210 60% 45% / 0.18) 0%, hsl(195 50% 70% / 0.10) 50%, transparent 85%)'
```

This creates a clearly visible warm wash at the top that fades to the background color — bold enough to notice, soft enough not to compete with the card.

### Files Modified
- `src/pages/Index.tsx` — 2 lines changed (gradient values)

