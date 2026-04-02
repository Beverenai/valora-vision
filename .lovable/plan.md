

# Move "Our Team" Section Directly Under "About Us"

## Current Order (left column)
1. About Us
2. Agency context
3. Sales Statistics
4. Property Map
5. Property Cards
6. **Our Team** ← currently here
7. Service Areas
8. Reviews

## New Order
1. About Us
2. **Our Team** ← move here
3. Agency context
4. Sales Statistics
5. Property Map
6. Property Cards
7. Service Areas
8. Reviews

## File to change

| File | Change |
|------|--------|
| `src/pages/AgentProfile.tsx` | Move the team section block (lines 688–780 approx) from after Property Cards to immediately after the About Us section (after line 596) |

One block move, no logic changes.

