

# Layer 4: AI Reasoning — Structured Data Package + Structured Output

## What This Does

Upgrades the AI calls in both `calculate-valuation` and `analyze-listing` to use **tool calling** for structured JSON output instead of free-text prompts. The AI receives a complete pre-computed data package (property, valuation, comparables, zone_stats, feature_impacts) and returns structured analysis with specific fields for sell vs buy flows.

## Current State

- Both edge functions already call Lovable AI (gemini-2.5-flash-lite) with simple text prompts
- Output is unstructured free-text stored in `analysis` and `market_trends` columns
- No structured fields like `strengths`, `considerations`, `recommended_listing_price`, `verdict`, etc.
- The AI prompt doesn't receive the full data package — it gets a loose text description

## Changes

### 1. Migration: Add structured AI output columns

Add new JSON columns to `leads_sell`, `leads_rent`, and `buy_analyses` to store the structured AI output:

```sql
-- leads_sell
ALTER TABLE leads_sell ADD COLUMN IF NOT EXISTS ai_strengths JSONB;
ALTER TABLE leads_sell ADD COLUMN IF NOT EXISTS ai_considerations JSONB;
ALTER TABLE leads_sell ADD COLUMN IF NOT EXISTS recommended_listing_price INTEGER;
ALTER TABLE leads_sell ADD COLUMN IF NOT EXISTS quick_sale_price INTEGER;

-- leads_rent  
ALTER TABLE leads_rent ADD COLUMN IF NOT EXISTS ai_strengths JSONB;
ALTER TABLE leads_rent ADD COLUMN IF NOT EXISTS ai_considerations JSONB;

-- buy_analyses
ALTER TABLE buy_analyses ADD COLUMN IF NOT EXISTS ai_verdict TEXT;
ALTER TABLE buy_analyses ADD COLUMN IF NOT EXISTS ai_price_context TEXT;
ALTER TABLE buy_analyses ADD COLUMN IF NOT EXISTS ai_worth_noting JSONB;
ALTER TABLE buy_analyses ADD COLUMN IF NOT EXISTS ai_negotiation_context TEXT;
```

### 2. Update `calculate-valuation/index.ts` — Structured AI calls

Replace the current free-text AI prompts with:

1. **Build a structured data package** containing property details, computed valuation, comparable summary stats, zone_stats, and feature impacts — matching the user's spec
2. **Use tool calling** to get structured output:
   - For SELL: `generate_sell_analysis` tool returning `{ summary, detailed_analysis, strengths[], considerations[], recommended_listing_price, quick_sale_price }`
   - For RENT: `generate_rent_analysis` tool returning `{ summary, detailed_analysis, strengths[], considerations[] }`
3. **Upgrade model** from `gemini-2.5-flash-lite` to `google/gemini-3-flash-preview` for better reasoning quality
4. **Set temperature to 0.3** for consistent, non-creative output
5. **System prompt**: Neutral, data-driven tone; never say "too expensive"; reference real data
6. Store structured fields in new columns, keep `analysis` column populated with `summary + detailed_analysis` for backward compatibility

### 3. Update `analyze-listing/index.ts` — Structured BUY analysis

Same approach for buy flow:

1. **Build data package** with asking price, estimated value, deviation, comparables, zone context
2. **Use tool calling**: `generate_buy_analysis` tool returning `{ verdict, summary, price_context, worth_noting[], negotiation_context }`
3. **System prompt**: Explicitly neutral — "never say too expensive", present as "Above Market" / "Fair Price"
4. Store in new columns (`ai_verdict`, `ai_price_context`, `ai_worth_noting`, `ai_negotiation_context`)

### 4. Market trends — kept as free text

The trends call stays as-is (free text in `market_trends` column) since it doesn't need structured output.

## Technical Details

**Tool calling schema example (sell):**
```json
{
  "name": "generate_sell_analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "summary": { "type": "string" },
      "detailed_analysis": { "type": "string" },
      "strengths": { "type": "array", "items": { "type": "string" } },
      "considerations": { "type": "array", "items": { "type": "string" } },
      "recommended_listing_price": { "type": "integer" },
      "quick_sale_price": { "type": "integer" }
    },
    "required": ["summary", "detailed_analysis", "strengths", "considerations", "recommended_listing_price", "quick_sale_price"]
  }
}
```

**Data package sent to AI** includes all pre-computed values from Layers 2+3 — the AI interprets, it does not calculate.

## Files Modified

- New migration SQL (add structured columns)
- `supabase/functions/calculate-valuation/index.ts` — structured data package + tool calling for sell/rent
- `supabase/functions/analyze-listing/index.ts` — structured data package + tool calling for buy

## Backward Compatibility

- `analysis` column still populated (summary + detailed_analysis concatenated)
- `market_trends` column unchanged
- Frontend can progressively adopt new structured fields

