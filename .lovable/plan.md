

# Three Features: Social Sharing, PDF Report, Merit Score Algorithm

## Feature 1: Social Sharing with Reference Code

### Current State
- `handleShare` on SellResult/RentResult uses `navigator.share` with basic text, no ref code or WhatsApp deeplink
- Reference code already exists via `formatRefCode(lead.id)`

### Changes

**SellResult.tsx** — Replace `handleShare` with a share menu offering:
- **WhatsApp**: `https://wa.me/?text={encoded message}` with ref code + valuation link
- **Email**: `mailto:?subject=...&body=...` with ref code + valuation link  
- **Copy link**: Current clipboard behavior

Pre-generated message template:
```
I valued my property on ValoraCasa (Ref: VC-A3B7) and received an estimate of €850,000.
See the full report: https://valoracasa.es/sell/result/abc123
```

UI: Replace single share button with a Popover containing 3 options (WhatsApp, Email, Copy).

**RentResult.tsx** — Same pattern adapted for rental estimates.

### Files: `SellResult.tsx`, `RentResult.tsx`

---

## Feature 2: PDF Valuation Report

### Current State
- "Download PDF" button shows "Coming Soon" toast

### Changes

**Create edge function `generate-valuation-pdf`** that:
- Accepts `lead_id` and `lead_type` (sell/rent)
- Fetches lead data from `leads_sell` or `leads_rent`
- Generates PDF using a server-side approach (build HTML, convert or use a PDF lib available in Deno)
- Returns PDF as downloadable response

**Alternative (simpler)**: Generate PDF client-side using `jspdf` + `html2canvas`:
- Add `jspdf` and `html2canvas` as dependencies
- Capture the result card and key sections as images
- Compose into a branded PDF with logo, ref code, and all valuation data
- Trigger browser download

**SellResult.tsx / RentResult.tsx** — Replace "Coming Soon" toast with actual PDF generation call.

### Files: `SellResult.tsx`, `RentResult.tsx`, possibly new edge function

---

## Feature 3: Merit Score Algorithm Improvement

### Current State
- Simple inline calculation in ProDashboard (line 275-279): profile fields count * 30% + rating * 20% + hardcoded 50/40/80 for response/conversion/profile
- No real response time or conversion tracking

### Changes

**Improve the merit score calculation** to use real data:
- Profile completeness (10%): bio, logo, description, phone, website, tagline, cover_photo_url, languages
- Rating (25%): `avg_rating / 5 * 100`
- Zone coverage (15%): whether agent has active zones
- Lead responsiveness (20%): calculate from `agent_contact_requests` — time between `created_at` and status change to 'contacted'
- Review count (15%): normalize `total_reviews` (cap at 20 for 100%)
- Conversion rate (15%): leads marked 'converted' / total leads

Since response time tracking doesn't exist yet, use a proxy: leads with status != 'new' within 24h = responsive. This avoids schema changes.

**ProDashboard.tsx** — Update the merit score computation to use the real data already loaded (leads, reviews, zones).

### Files: `src/pages/ProDashboard.tsx`

---

## Implementation Order
1. Social sharing (SellResult + RentResult)
2. Merit score algorithm improvement (ProDashboard)
3. PDF report generation

