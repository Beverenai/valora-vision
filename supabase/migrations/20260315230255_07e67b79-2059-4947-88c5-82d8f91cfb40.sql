ALTER TABLE public.leads_rent ADD COLUMN IF NOT EXISTS views text;
ALTER TABLE public.leads_rent ADD COLUMN IF NOT EXISTS property_features text;