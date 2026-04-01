-- 1. Create zone_stats materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.zone_stats AS
SELECT
  al.zone_id,
  al.operation,
  al.property_type,

  -- Price per m² stats
  COUNT(*)::integer AS listing_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2)::integer AS median_price_m2,
  AVG(al.price_per_m2)::integer AS avg_price_m2,
  MIN(al.price_per_m2)::integer AS min_price_m2,
  MAX(al.price_per_m2)::integer AS max_price_m2,
  COALESCE(STDDEV(al.price_per_m2), 0)::integer AS stddev_price_m2,

  -- Absolute price stats
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price)::integer AS median_price,
  AVG(al.price)::integer AS avg_price,

  -- Size stats
  AVG(al.size_m2)::integer AS avg_size_m2,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.size_m2)::integer AS median_size_m2,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.rooms)::integer AS median_rooms,

  -- Feature prevalence (%)
  ROUND(AVG(al.has_pool::int) * 100, 1)::numeric AS pct_with_pool,
  ROUND(AVG(al.has_garage::int) * 100, 1)::numeric AS pct_with_garage,
  ROUND(AVG(al.has_sea_views::int) * 100, 1)::numeric AS pct_with_sea_views,
  ROUND(AVG(al.has_terrace::int) * 100, 1)::numeric AS pct_with_terrace,
  ROUND(AVG(al.has_lift::int) * 100, 1)::numeric AS pct_with_lift,

  -- Feature premium: median price WITH feature
  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_pool = true))::integer AS median_m2_with_pool,
  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_pool = false))::integer AS median_m2_without_pool,
  COUNT(*) FILTER (WHERE al.has_pool = true)::integer AS count_with_pool,

  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_sea_views = true))::integer AS median_m2_with_sea_views,
  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_sea_views = false))::integer AS median_m2_without_sea_views,
  COUNT(*) FILTER (WHERE al.has_sea_views = true)::integer AS count_with_sea_views,

  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_garage = true))::integer AS median_m2_with_garage,
  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_garage = false))::integer AS median_m2_without_garage,
  COUNT(*) FILTER (WHERE al.has_garage = true)::integer AS count_with_garage,

  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_terrace = true))::integer AS median_m2_with_terrace,
  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_terrace = false))::integer AS median_m2_without_terrace,
  COUNT(*) FILTER (WHERE al.has_terrace = true)::integer AS count_with_terrace,

  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_lift = true))::integer AS median_m2_with_lift,
  (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY al.price_per_m2) FILTER (WHERE al.has_lift = false))::integer AS median_m2_without_lift,
  COUNT(*) FILTER (WHERE al.has_lift = true)::integer AS count_with_lift,

  -- Freshness
  MAX(al.scraped_at) AS last_data_update

FROM public.active_listings al
WHERE al.zone_id IS NOT NULL
GROUP BY al.zone_id, al.operation, al.property_type;

-- 2. Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_zone_stats_unique ON public.zone_stats (zone_id, operation, property_type);
CREATE INDEX idx_zone_stats_zone ON public.zone_stats (zone_id);

-- 3. Refresh function for zone_stats
CREATE OR REPLACE FUNCTION public.refresh_zone_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.zone_stats;
END;
$$;

-- 4. Update refresh_active_listings to chain zone_stats refresh
CREATE OR REPLACE FUNCTION public.refresh_active_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.active_listings;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.zone_stats;
END;
$$;

-- 5. get_zone_stats RPC
CREATE OR REPLACE FUNCTION public.get_zone_stats(
  p_zone_id uuid,
  p_operation text,
  p_property_type text
)
RETURNS TABLE (
  zone_id uuid,
  operation text,
  property_type text,
  listing_count integer,
  median_price_m2 integer,
  avg_price_m2 integer,
  min_price_m2 integer,
  max_price_m2 integer,
  stddev_price_m2 integer,
  median_price integer,
  avg_price integer,
  avg_size_m2 integer,
  median_size_m2 integer,
  median_rooms integer,
  pct_with_pool numeric,
  pct_with_garage numeric,
  pct_with_sea_views numeric,
  pct_with_terrace numeric,
  pct_with_lift numeric,
  median_m2_with_pool integer,
  median_m2_without_pool integer,
  count_with_pool integer,
  median_m2_with_sea_views integer,
  median_m2_without_sea_views integer,
  count_with_sea_views integer,
  median_m2_with_garage integer,
  median_m2_without_garage integer,
  count_with_garage integer,
  median_m2_with_terrace integer,
  median_m2_without_terrace integer,
  count_with_terrace integer,
  median_m2_with_lift integer,
  median_m2_without_lift integer,
  count_with_lift integer,
  last_data_update timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.zone_stats zs
  WHERE zs.zone_id = p_zone_id
    AND zs.operation = p_operation
    AND zs.property_type = p_property_type
  LIMIT 1;
$$;