

## Plan: Simplify "Want to Sell?" Button Labels

One small change in `src/components/sell/SellContactStep.tsx`:

- **Line 115**: Change `"No, I just want the value"` → `"No"`
- When "No" is selected, the follow-up text/questions underneath already clarify the intent (refinancing question), so the long label is unnecessary.

### Files changed
- `src/components/sell/SellContactStep.tsx` — shorten the "No" pill button label

