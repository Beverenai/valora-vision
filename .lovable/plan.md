

# Gamified Merit Score Breakdown with Actionable Navigation

## What Changes

The current Merit Score card shows a single number + 7 tiny labels with raw scores (0-100). Agents don't understand what each score means, how much weight it carries, or how to improve it. We'll replace this with an interactive, gamified breakdown that makes scoring transparent and improvement effortless.

## New Merit Score Card Design

### Overall Score (top)
- Keep the circular progress ring + total score
- Add a subtitle: **"Your Merit Score determines your visibility to property sellers — combined with your subscription tier"**
- Add a small info tooltip: "Higher scores = more prominent placement in valuation results"

### Category Breakdown (7 rows)
Each of the 7 factors becomes a visual row showing:

```text
┌──────────────────────────────────────────────────────────┐
│  📝 Profile Completeness              6 / 8 pts    [→]  │
│  ████████████████████░░░░  75%                           │
│  "Complete your tagline and cover photo"                 │
├──────────────────────────────────────────────────────────┤
│  ⭐ Client Rating                    16 / 20 pts        │
│  ████████████████████░░░░  80%                           │
│  "Maintain great service to keep your rating high"       │
├──────────────────────────────────────────────────────────┤
│  📍 Zone Coverage                    12 / 12 pts   [→]  │
│  ████████████████████████  100%  ✓                       │
└──────────────────────────────────────────────────────────┘
```

- **Label** with icon + category name
- **Score**: weighted points earned / max weighted points (e.g., "6 / 8" for Profile at 8% weight)
- **Progress bar** colored: green (80%+), amber (40-79%), red (<40%)
- **Hint text**: contextual tip when score < 100%
- **Action button** `[Improve →]`: clickable, navigates to the relevant dashboard section (`setSection("profile")`, `setSection("zones")`, etc.). Hidden when score is 100%.
- **Checkmark** shown when category is maxed out

### Visibility Explainer (bottom)
A subtle banner below the breakdown:
> "Your visibility ranking = Merit Score × Subscription Tier. Upgrade your plan for maximum exposure." with a link to the subscription section.

## Categories with hints and navigation targets

| Category | Weight | Max pts | Hint when low | Nav target |
|----------|--------|---------|----------------|------------|
| Profile | 8 | 8 | "Add bio, logo, tagline, cover photo" | `profile` |
| Rating | 20 | 20 | "Great reviews boost your rating" | `reviews` |
| Zones | 12 | 12 | "Select service zones to appear in results" | `zones` |
| Reviews | 12 | 12 | "Ask satisfied clients for reviews" | `reviews` |
| Response | 18 | 18 | "Respond to new leads promptly" | `leads` |
| Conversion | 12 | 12 | "Mark leads as converted when you close deals" | `leads` |
| Sales | 18 | 18 | "Add more verified sales to your portfolio" | `sales` |

## Remove separate Action Items card
The action items card becomes redundant since each merit category now has its own "Improve" button. Remove it.

## File changes

| File | Change |
|------|--------|
| `src/pages/ProDashboard.tsx` | Rewrite the Merit Score card in `OverviewSection` with category rows, progress bars, hints, action buttons, and visibility explainer. Remove the Action Items card. |

No database changes needed.

