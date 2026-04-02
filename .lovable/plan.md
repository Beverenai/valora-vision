

# Fix: Admin Map Shows No Valuations

## Root Cause

The `ValuationsMapTab` queries leads with `.eq("status", "completed")`, but all 6 leads in the database have `status: "ready"`. The statuses never match, so zero points are returned and the map shows "No valuation data found."

## Duplicate Addresses

5 of the 6 leads share the same address ("Avenida del Prado 5"). These should be deduplicated on the map so only one pin appears per unique address.

## Fix (1 file)

**`src/pages/Admin.tsx` — ValuationsMapTab function (lines 810-817)**

1. Change `.eq("status", "completed")` to `.in("status", ["completed", "ready"])` for both `leads_sell` and `leads_rent` queries — this catches all finished valuations regardless of the status label used.

2. After merging `sellPoints` and `rentPoints`, deduplicate by address: group points by `address` (lowercased, trimmed), keep only the most recent entry per address (by `created_at`). This prevents 5 overlapping pins for the same property.

