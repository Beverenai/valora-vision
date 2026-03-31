

## Plan: Fix Step 2 AI Animation — Minimum Display Time + Animated Checklist

### Problem
The API response arrives and immediately replaces the loading steps with the final steps array, then auto-advances to Step 3 after only 2 seconds. The "wow factor" checklist animation is lost.

### Solution
Rewrite the Step 2 logic to **animate steps sequentially** on the client side, independent of when the API returns. Use `Promise.all` with a minimum timer to ensure at least 4 seconds of animation.

### Changes in `src/pages/ProOnboard.tsx`

**1. Replace `runAiOnboarding` logic (lines 85-146)**

Instead of showing API-returned steps directly, define a fixed checklist of UI steps and animate them one by one:

- Define the expected steps based on whether `website` was provided (6 steps with website, 3 without)
- Start the API call and a minimum 4-second timer with `Promise.all`
- Use a sequential animation loop: show each step as "loading" for ~800ms, then mark it "done"/"skip" based on the actual API response (stored in a ref)
- Only set `aiDone = true` and auto-advance after both the animation sequence AND the API call are complete

**2. Step sequence (with website):**
```
scan_website  → "Scanning your website..."      → "Found your logo" / "Website scanned"
generate_desc → "Generating description..."     → "Generated description"
find_team     → "Looking for team members..."   → "Found X team members" / "No team found"
languages     → "Detecting languages..."        → "Detected: en, es, ..."
google        → "Checking Google reviews..."    → "Found X reviews (X.X★)" / "No reviews found"
social        → "Finding social media..."       → "Found social links" / "No social links"
```

**Without website:** Skip scan_website and social, show 4 steps.

**3. Animation timing:**
- Each step appears with 800ms stagger
- Steps start as "loading" (spinner), then transition to "done" (check) or "skip"
- If API finishes before animation, results are buffered; if API takes longer, show "Almost ready..." pulse after all animated steps complete

**4. Auto-advance (lines 141-146):**
- Change from 2s delay to immediate advance once both API and animation are done (the animation itself provides the 4s+ minimum)

### Files Modified
- `src/pages/ProOnboard.tsx` — rewrite `runAiOnboarding`, update auto-advance logic, keep Step 2 UI mostly the same

