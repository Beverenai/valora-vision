

## Plan: Add Tap + Keyboard Triggers to Card Reveal

### Problem
The sealed card only opens via drag gesture, which is unreliable on some devices and impossible for automated testing or keyboard users.

### Changes in `src/components/shared/CardRevealWrapper.tsx`

**1. Add tap-to-open on the sealed card body (lines 347-381)**
- Wrap the sealed card area with an `onClick={triggerReveal}` and `onKeyDown` (Enter/Space) handler
- Add `tabIndex={0}` and `role="button"` for keyboard accessibility
- The existing drag interaction remains as primary; tap/click acts as secondary trigger

**2. Add delayed hint text (lines 247-253)**
- Replace the static "← Slide to open" text with a state-driven hint
- After 3 seconds of no interaction, change text to "Tap or slide to reveal"
- Add a `showTapHint` state with a `setTimeout` in the sealed phase
- Reset the timer if the user starts dragging

**3. Implementation detail**

In `CardRevealWrapper`:
```tsx
const [showTapHint, setShowTapHint] = useState(false);

useEffect(() => {
  if (phase !== "sealed") return;
  const timer = setTimeout(() => setShowTapHint(true), 3000);
  return () => clearTimeout(timer);
}, [phase]);
```

In `SealedWrapper`, add a new prop `onTap` and wire it:
- The outer `div` gets `onClick={onTap}`, `onKeyDown` (Enter/Space calls `onTap`), `tabIndex={0}`, `role="button"`, `aria-label="Open valuation"`
- Exclude the drag tab from triggering tap (use `e.stopPropagation()` on the drag handle)

Update the hint text (line 252):
```tsx
{showTapHint ? "Tap or slide to reveal" : "← Slide to open"}
```

Pass `showTapHint` and `onTap={onTear}` as new props to `SealedWrapper`.

### Files Modified
- `src/components/shared/CardRevealWrapper.tsx`

