CREATE OR REPLACE FUNCTION public.find_nearby_agent_sales(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC DEFAULT 5,
  p_limit INT DEFAULT 50
)
RETURNS SETOF public.agent_sales
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.agent_sales
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng::float8, p_lat::float8), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY ST_Distance(
    ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography,
    ST_SetSRID(ST_MakePoint(p_lng::float8, p_lat::float8), 4326)::geography
  )
  LIMIT p_limit;
$$;