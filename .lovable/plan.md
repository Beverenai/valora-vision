

# Unified Properties Schema — Completed

## What Was Done

1. **Created unified `properties` table** — consolidates `properties_for_sale` + `properties_for_rent` with `operation` column (sale/rent), boolean feature flags, PostGIS auto-trigger, spatial + standard indexes
2. **Created `valuations` table** — stores user valuation requests with results, rental estimates, market context, contact info
3. **Created `valuation_comparables` table** — links valuations to matched properties with similarity score and distance
4. **Created unified `find_comparables` RPC** — single function replacing `find_sale_comparables` and `find_rent_comparables`
5. **Migrated existing data** from old tables into unified `properties` table
6. **Updated all 4 edge functions** to use the new unified table and RPC

### Old tables preserved (not dropped) for backward compatibility
