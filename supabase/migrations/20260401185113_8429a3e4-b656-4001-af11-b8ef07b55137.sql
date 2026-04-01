
-- Add columns to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS data_source text NOT NULL DEFAULT 'idealista',
  ADD COLUMN IF NOT EXISTS resales_reference text,
  ADD COLUMN IF NOT EXISTS resales_filter_id integer;

CREATE INDEX IF NOT EXISTS idx_properties_data_source ON public.properties (data_source);
CREATE INDEX IF NOT EXISTS idx_properties_resales_reference ON public.properties (resales_reference) WHERE resales_reference IS NOT NULL;

-- Resales Online config table
CREATE TABLE public.resales_online_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id text NOT NULL,
  api_key text NOT NULL,
  filter_alias text NOT NULL DEFAULT 'sale',
  filter_id integer NOT NULL DEFAULT 1,
  province text DEFAULT 'Málaga',
  sync_interval_hours integer DEFAULT 24,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  last_sync_status text DEFAULT 'never',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.resales_online_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read resales config" ON public.resales_online_config FOR SELECT USING (true);
CREATE POLICY "Service role can manage resales config" ON public.resales_online_config FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Resales sync log table
CREATE TABLE public.resales_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES public.resales_online_config(id) ON DELETE SET NULL,
  filter_alias text,
  status text NOT NULL DEFAULT 'running',
  properties_fetched integer DEFAULT 0,
  properties_upserted integer DEFAULT 0,
  properties_deactivated integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds numeric
);

ALTER TABLE public.resales_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sync logs" ON public.resales_sync_log FOR SELECT USING (true);
CREATE POLICY "Service role can manage sync logs" ON public.resales_sync_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Deduplication function
CREATE OR REPLACE FUNCTION public.find_potential_duplicates()
RETURNS TABLE (
  property_a uuid,
  property_b uuid,
  source_a text,
  source_b text,
  distance_m numeric,
  price_diff_pct numeric
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT
    a.id AS property_a,
    b.id AS property_b,
    a.data_source AS source_a,
    b.data_source AS source_b,
    ROUND(ST_Distance(a.location_point::geography, b.location_point::geography)::numeric, 1) AS distance_m,
    ROUND(ABS(a.price - b.price)::numeric / NULLIF(GREATEST(a.price, b.price), 0) * 100, 1) AS price_diff_pct
  FROM properties a
  JOIN properties b ON a.id < b.id
    AND a.data_source <> b.data_source
    AND a.is_active = true AND b.is_active = true
    AND a.location_point IS NOT NULL AND b.location_point IS NOT NULL
    AND ST_DWithin(a.location_point::geography, b.location_point::geography, 100)
    AND a.property_type = b.property_type
    AND a.rooms = b.rooms
    AND ABS(COALESCE(a.size_m2,0) - COALESCE(b.size_m2,0)) <= 15
    AND ABS(a.price - b.price)::numeric / NULLIF(GREATEST(a.price, b.price), 0) < 0.15
  LIMIT 100;
$$;

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_listings;
  REFRESH MATERIALIZED VIEW CONCURRENTLY zone_stats;
END;
$$;
