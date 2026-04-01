
-- Layer 4: Add structured AI output columns

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
