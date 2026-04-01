

## Plan: SectionSkeleton, Sticky Agent Button, Typewriter Hero

### 1. Create `SectionSkeleton` component

**New file: `src/components/ui/SectionSkeleton.tsx`**

Animated pulse skeleton with configurable row count — label placeholder, heading placeholder, and content rows with decreasing widths. Replace the current `SectionFallback` spinner in `SellResult.tsx` with this component.

### 2. Replace Suspense fallbacks in SellResult

**Modified: `src/pages/SellResult.tsx`**

Replace the inline `SectionFallback` spinner component with `<SectionSkeleton rows={4} />` for both lazy bundle Suspense boundaries.

### 3. Create Sticky "Find Agent" button

**New file: `src/components/shared/StickyAgentButton.tsx`**

Fixed bottom-right floating button with `Users` icon and "Find your agent" text (hidden on mobile, icon-only). Uses `animate-in fade-in slide-in-from-bottom-4`. On click, scrolls to the matched agents section (`[data-section="matched-agents"]` or similar ID).

**Modified: `src/pages/SellResult.tsx`**
- Import and render `StickyAgentButton` inside the result view (after CardRevealWrapper content).

**Modified: `src/components/ResultAgentGroup.tsx`**
- Add `id="matched-agents"` to the MatchedAgentsSection wrapper so the sticky button can scroll to it.

### 4. Typewriter effect in hero

**New file: `src/components/shared/TypewriterText.tsx`**

Rotates through an array of phrases with a typing/deleting animation:
- Types character by character (50ms interval)
- Pauses 2s at full phrase
- Deletes character by character (30ms interval)
- Moves to next phrase

Props: `phrases: string[]`, `className?: string`

**Modified: `src/pages/Index.tsx`**
- Import `TypewriterText`
- In the SELL hero, replace the static `h1` text with the typewriter cycling through:
  - "What is your apartment worth?"
  - "What can your villa sell for?"
  - "Find the value of your property"
  - "Free valuation in 2 minutes"
- Keep the BUY hero text static (it's already distinct)

### Files

| Action | File |
|--------|------|
| New | `src/components/ui/SectionSkeleton.tsx` |
| New | `src/components/shared/StickyAgentButton.tsx` |
| New | `src/components/shared/TypewriterText.tsx` |
| Modified | `src/pages/SellResult.tsx` — use SectionSkeleton, add StickyAgentButton |
| Modified | `src/components/ResultAgentGroup.tsx` — add scroll target ID |
| Modified | `src/pages/Index.tsx` — add TypewriterText to sell hero |

