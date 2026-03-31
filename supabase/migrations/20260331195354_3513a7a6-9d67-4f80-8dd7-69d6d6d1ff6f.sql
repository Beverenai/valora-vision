
CREATE OR REPLACE FUNCTION public.match_agents_by_location(
  p_lat double precision,
  p_lng double precision,
  p_limit integer DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  company_name text,
  slug text,
  logo_url text,
  tagline text,
  bio text,
  avg_rating numeric,
  total_reviews integer,
  is_verified boolean,
  languages text[],
  website text,
  distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.company_name,
    p.slug,
    p.logo_url,
    p.tagline,
    p.bio,
    p.avg_rating,
    p.total_reviews,
    p.is_verified,
    p.languages,
    p.website,
    ROUND(
      (6371 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians(p_lat)) * cos(radians(z.center_lat)) *
          cos(radians(z.center_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(z.center_lat))
        ))
      ))::numeric, 1
    ) AS distance_km
  FROM professionals p
  JOIN professional_zones pz ON pz.professional_id = p.id AND pz.is_active = true
  JOIN zones z ON z.id = pz.zone_id
  WHERE p.is_active = true
    AND z.center_lat IS NOT NULL
    AND z.center_lng IS NOT NULL
  GROUP BY p.id, p.company_name, p.slug, p.logo_url, p.tagline, p.bio,
           p.avg_rating, p.total_reviews, p.is_verified, p.languages, p.website,
           z.center_lat, z.center_lng
  ORDER BY distance_km ASC, p.avg_rating DESC NULLS LAST, p.total_reviews DESC NULLS LAST
  LIMIT p_limit;
$$;
