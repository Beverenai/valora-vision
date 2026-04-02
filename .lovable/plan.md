

# Revamp /pro "Market Insight" Section with KPMG Seller Behaviour Data

## Concept

Instead of quoting RealAdvisor's traffic numbers, we use the KPMG study to tell a story about **how Spanish homeowners behave before selling** — and why that makes ValoraCasa valuable. Two parts:

### Part A — "How sellers start their journey" (KPMG-backed)
A bento grid showing general market behaviour insights sourced from KPMG Spain:

| Card | Stat | Copy |
|------|------|------|
| Wide card | "1 in 2" | "One in two sellers uses an online valuation tool before contacting an agent" |
| Card | "87%" | "of agents who join online platforms renew their subscription" |
| Card | "14%" | "of clients come through referrals from other satisfied clients" |
| Banner | — | "Sellers today research online first. If you're not visible where they look, you're invisible." |

Source line: "Source: KPMG Spain, 2025"

Each card uses the same rounded-2xl border bg-card style from Index.tsx bento grid.

### Part B — "What sellers look for in an agent" (keep + upgrade)
Keep the existing 5 factors (Proximity 29%, Reviews 21%, Recent Sales 19%, Experience 18%, Brand 14%) but upgrade the visual to bento-style cards instead of plain circles. Each card gets:
- Icon + percentage in large bold text
- Label + one-line explanation of why it matters
- Subtle progress bar showing the percentage

SectionLabel "Market Insight" above the whole section. Subtitle references the KPMG study properly.

### Part C — Vertical timeline for "How it works"
Adopt the Index.tsx vertical timeline pattern (numbered circles, icon pills, connecting line) instead of the current 3-column grid.

## Files to change

| File | Change |
|------|--------|
| `src/pages/ProLanding.tsx` | Replace "What sellers look for" with two-part KPMG section (seller journey + agent factors); upgrade "How it works" to vertical timeline; add SectionLabel components |

No database changes needed.

