

# Fix Agent Onboarding & Profile Issues

## Overview
Three fixes for the agent onboarding flow: improve profile lookup resilience, fix logo display, and ensure the Step 2 AI animation plays fully. Also remove the skip button from Step 2.

## Changes

### Fix 1: AgentProfile.tsx — Better "not found" handling
The code already uses `.ilike('slug', slug)` and has a decent fallback UI (lines 271-293). The existing implementation looks correct. Minor improvements:
- Add a "Search the directory" CTA linking to `/agentes`
- Add a hint about checking the URL

No slug generation changes needed — the `handlePublish` function (line 353-361) already normalizes correctly with diacritic stripping, lowercase, and hyphenation.

### Fix 2: ProOnboard.tsx — Logo display in Step 3
The logo handling (lines 618-643) already has `logoFailed` state and initials fallback. Issues to fix:
- Ensure the initials fallback circle uses terracotta color (`bg-[#D4713B]`) instead of `bg-primary` for consistency with the brand
- The code already handles `onError` and file upload correctly
- No changes needed for logo_url passing — it's set at line 196

### Fix 3: ProOnboard.tsx — Step 2 animation must play fully
The animation code (lines 158-287) has a 4-second minimum timer and sequential 800ms delays. Issues:
1. **Remove the skip button** (line 597-599) — user explicitly says no skip button
2. **Remove auto-advance** (lines 296-301) — the `useEffect` that auto-advances when `aiDone` fires after only 500ms. Instead, show a "Continue" button after animation completes so the agent feels in control
3. **Fix useEffect deps** — `runAiOnboarding` is missing from the dependency array of the step-trigger effect (line 290-294), which could cause stale closures

### Files Modified
- `src/pages/AgentProfile.tsx` — minor fallback UI improvement
- `src/pages/ProOnboard.tsx` — remove skip button, remove auto-advance, add manual continue after animation, fix terracotta color on logo fallback

