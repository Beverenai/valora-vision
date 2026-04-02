

# Forbedringer for Agent Sales Portfolio

Basert på spec-dokumentet vs. det som er implementert, er dette det som mangler eller kan forbedres:

## 1. Merit Score mangler "Sales"-faktor
Spec sier: 0 sales = 0pts, 1-5 = 30, 6-15 = 60, 16-30 = 80, 30+ = 100, +10 bonus if >50% verified. Nåværende merit score har 6 faktorer uten sales. Vi legger til en 7. faktor og justerer vektene.

## 2. Incentive-kort mangler checklist fra spec
Spec viser en detaljert incentive-checklist med progressive milestones:
- "Appear in Recent Sales on your public profile" (1+ sale)
- "Unlock sales map on your profile" (3+ sales)
- "+30 merit points and higher search ranking" (5+ sales)
- "Top Seller badge on valuation results" (10+ sales)
- "Verified Track Record trust badge" (5+ verified)

Nåværende implementering har bare en enkel progress bar. Erstatt med spec-designet.

## 3. Action item for 0 sales
Legg til i overview action items: "Register your first sale" når agent har 0 sales.

## 4. Photo upload mangler — bare URL-felt
Spec sier photo upload step (optional). Nåværende dialog har bare et "Photo URL" tekstfelt. Legg til faktisk bilde-opplasting via storage.

## 5. show_price toggle mangler i AddSaleDialog
Spec legger vekt på at agenten velger om prisen vises offentlig. Legg til en Switch for dette.

---

## Tekniske detaljer

### Files Modified
- `src/pages/ProDashboard.tsx` — merit score: legg til salesMerit-faktor, juster vekter, legg til action item for 0 sales
- `src/components/dashboard/SalesSection.tsx` — erstatt enkel milestone-kort med detaljert checklist fra spec
- `src/components/dashboard/AddSaleDialog.tsx` — legg til show_price switch, foto-opplasting via storage bucket

### Merit Score nye vekter (7 faktorer)
```text
Profile:     8%  (was 10%)
Rating:     20%  (was 25%)
Zones:      12%  (was 15%)
Reviews:    12%  (was 15%)
Response:   18%  (was 20%)
Conversion: 12%  (was 15%)
Sales:      18%  (new)
```

### Sales scoring
```text
0 sales     → 0
1-5 sales   → 30
6-15 sales  → 60
16-30 sales → 80
30+ sales   → 100
+10 bonus if >50% verified (cap 100)
```

