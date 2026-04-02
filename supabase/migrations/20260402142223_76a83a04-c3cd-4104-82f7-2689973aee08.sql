
-- Create reusable updated_at function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create agent_sales table
CREATE TABLE public.agent_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  built_size_sqm NUMERIC,
  plot_size_sqm NUMERIC,
  sale_price NUMERIC,
  show_price BOOLEAN NOT NULL DEFAULT true,
  address_text TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  location_point GEOGRAPHY(Point, 4326),
  zone_id UUID REFERENCES public.zones(id),
  sale_date DATE,
  listed_date DATE,
  days_on_market INTEGER GENERATED ALWAYS AS (
    CASE WHEN sale_date IS NOT NULL AND listed_date IS NOT NULL
         THEN (sale_date - listed_date)
         ELSE NULL
    END
  ) STORED,
  listing_url TEXT,
  listing_source TEXT,
  enriched_title TEXT,
  enriched_description TEXT,
  photo_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agent_sales_professional ON public.agent_sales(professional_id);
CREATE INDEX idx_agent_sales_location ON public.agent_sales USING GIST(location_point);
CREATE INDEX idx_agent_sales_sale_date ON public.agent_sales(sale_date DESC);

-- Trigger: auto-set location_point from lat/lng
CREATE OR REPLACE FUNCTION public.set_agent_sale_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_agent_sales_location
  BEFORE INSERT OR UPDATE ON public.agent_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.set_agent_sale_location_point();

-- Trigger: updated_at
CREATE TRIGGER update_agent_sales_updated_at
  BEFORE UPDATE ON public.agent_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.agent_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales are publicly readable"
  ON public.agent_sales FOR SELECT
  USING (true);

CREATE POLICY "Agents can insert own sales"
  ON public.agent_sales FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = agent_sales.professional_id
        AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update own sales"
  ON public.agent_sales FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = agent_sales.professional_id
        AND professionals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = agent_sales.professional_id
        AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can delete own sales"
  ON public.agent_sales FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = agent_sales.professional_id
        AND professionals.user_id = auth.uid()
    )
  );

-- Materialized view for quick stats
CREATE MATERIALIZED VIEW public.agent_sales_summary AS
SELECT
  professional_id,
  COUNT(*) AS total_sales,
  COUNT(*) FILTER (WHERE verified = true) AS verified_sales,
  COUNT(*) FILTER (WHERE sale_date >= CURRENT_DATE - INTERVAL '12 months') AS sales_last_12_months,
  ROUND(AVG(days_on_market)) AS avg_days_on_market,
  MAX(sale_date) AS last_sale_date
FROM public.agent_sales
GROUP BY professional_id;

CREATE UNIQUE INDEX idx_agent_sales_summary_prof ON public.agent_sales_summary(professional_id);
