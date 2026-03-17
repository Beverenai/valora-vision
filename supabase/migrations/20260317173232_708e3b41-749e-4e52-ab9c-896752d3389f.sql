
CREATE TABLE public.buy_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  source_platform TEXT,
  property_code TEXT,
  address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  property_type TEXT,
  size_m2 NUMERIC,
  rooms INTEGER,
  bathrooms INTEGER,
  asking_price NUMERIC NOT NULL,
  asking_price_per_m2 NUMERIC,
  features JSONB,
  thumbnail_url TEXT,
  image_urls TEXT[],
  estimated_value NUMERIC,
  estimated_low NUMERIC,
  estimated_high NUMERIC,
  estimated_price_per_m2 NUMERIC,
  area_median_price_per_m2 NUMERIC,
  price_deviation_percent NUMERIC(5,2),
  price_score TEXT,
  confidence_level TEXT,
  comparables_count INTEGER,
  comparable_properties JSONB,
  feature_adjustments JSONB,
  analysis TEXT,
  market_trends TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buy_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create buy analyses" ON public.buy_analyses FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read buy analyses" ON public.buy_analyses FOR SELECT TO public USING (true);
CREATE POLICY "Service role can update buy analyses" ON public.buy_analyses FOR UPDATE TO public USING (true) WITH CHECK (true);
