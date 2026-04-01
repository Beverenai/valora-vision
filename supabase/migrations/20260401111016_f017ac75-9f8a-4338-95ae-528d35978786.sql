
-- =====================================================
-- LAYER 2: SEARCH & MATCH
-- Materialized view + optimized RPC functions
-- =====================================================

-- 1. Materialized View: active_listings
DROP MATERIALIZED VIEW IF EXISTS active_listings;

CREATE MATERIALIZED VIEW active_listings AS
SELECT
  id,
  property_code,
  operation,
  property_type,
  price,
  price_per_m2,
  size_m2,
  rooms,
  bathrooms,
  floor,
  condition,
  (COALESCE(has_pool::int, 0) * 64 +
   COALESCE(has_garage::int, 0) * 32 +
   COALESCE(has_sea_views::int, 0) * 16 +
   COALESCE(has_terrace::int, 0) * 8 +
   COALESCE(has_garden::int, 0) * 4 +
   COALESCE(has_lift::int, 0) * 2 +
   COALESCE(has_ac::int, 0) * 1) AS feature_bits,
  has_pool, has_garage, has_sea_views, has_terrace,
  has_garden, has_lift, has_ac, has_balcony,
  latitude,
  longitude,
  location_point,
  zone_id,
  municipality,
  district,
  address,
  thumbnail_url,
  idealista_url,
  agency_name,
  agency_phone,
  scraped_at
FROM properties
WHERE is_active = TRUE
  AND scraped_at > NOW() - INTERVAL '90 days'
  AND price > 0
  AND size_m2 > 0;

-- 2. Unique index on id (required for CONCURRENTLY refresh)
CREATE UNIQUE INDEX idx_al_id ON active_listings(id);

-- 3. Indexes on the materialized view
CREATE INDEX idx_al_geo ON active_listings USING GIST(location_point);
CREATE INDEX idx_al_type_op ON active_listings(property_type, operation);
CREATE INDEX idx_al_rooms ON active_listings(rooms);
CREATE INDEX idx_al_size ON active_listings(size_m2);
CREATE INDEX idx_al_price ON active_listings(price_per_m2);
CREATE INDEX idx_al_zone ON active_listings(zone_id);
CREATE INDEX idx_al_municipality ON active_listings(municipality);

-- 4. Refresh function
CREATE OR REPLACE FUNCTION refresh_active_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_listings;
END;
$$;

-- 5. find_comparables_v2 — queries active_listings with similarity scoring
CREATE OR REPLACE FUNCTION find_comparables_v2(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_operation TEXT,
  p_property_type TEXT,
  p_size_m2 INTEGER,
  p_rooms INTEGER,
  p_radius_km DECIMAL DEFAULT 3.0,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  property_code TEXT,
  price INTEGER,
  price_per_m2 INTEGER,
  size_m2 INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT,
  address TEXT,
  municipality TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  thumbnail_url TEXT,
  idealista_url TEXT,
  has_pool BOOLEAN,
  has_garage BOOLEAN,
  has_sea_views BOOLEAN,
  has_terrace BOOLEAN,
  distance_km DOUBLE PRECISION,
  similarity_score DOUBLE PRECISION,
  scraped_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_point GEOGRAPHY;
BEGIN
  user_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  RETURN QUERY
  SELECT
    al.id,
    al.property_code,
    al.price,
    al.price_per_m2,
    al.size_m2,
    al.rooms,
    al.bathrooms,
    al.property_type,
    al.address,
    al.municipality,
    al.latitude,
    al.longitude,
    al.thumbnail_url,
    al.idealista_url,
    al.has_pool,
    al.has_garage,
    al.has_sea_views,
    al.has_terrace,
    ROUND((ST_Distance(al.location_point, user_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION AS distance_km,
    (
      (ST_Distance(al.location_point, user_point) / 1000.0) / GREATEST(p_radius_km, 1.0)
      + ABS(al.size_m2 - p_size_m2)::DECIMAL / GREATEST(p_size_m2, 1) * 2.0
      + ABS(al.rooms - p_rooms) * 0.5
    )::DOUBLE PRECISION AS similarity_score
  FROM active_listings al
  WHERE al.operation = p_operation
    AND al.property_type = p_property_type
    AND al.rooms BETWEEN (p_rooms - 1) AND (p_rooms + 1)
    AND al.size_m2 BETWEEN (p_size_m2 * 0.7)::INT AND (p_size_m2 * 1.3)::INT
    AND ST_DWithin(al.location_point, user_point, p_radius_km * 1000)
  ORDER BY similarity_score ASC
  LIMIT p_limit;
END;
$$;

-- 6. find_comparables_with_fallback — 4-stage expanding search
CREATE OR REPLACE FUNCTION find_comparables_with_fallback(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_operation TEXT,
  p_property_type TEXT,
  p_size_m2 INTEGER,
  p_rooms INTEGER,
  p_min_results INTEGER DEFAULT 8,
  p_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  property_code TEXT,
  price INTEGER,
  price_per_m2 INTEGER,
  size_m2 INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT,
  address TEXT,
  municipality TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  thumbnail_url TEXT,
  idealista_url TEXT,
  has_pool BOOLEAN,
  has_garage BOOLEAN,
  has_sea_views BOOLEAN,
  has_terrace BOOLEAN,
  distance_km DOUBLE PRECISION,
  similarity_score DOUBLE PRECISION,
  scraped_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  result_count INTEGER;
  user_point GEOGRAPHY;
BEGIN
  user_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  -- Create temp table for results
  CREATE TEMP TABLE IF NOT EXISTS _fb_comps (
    id UUID, property_code TEXT, price INTEGER, price_per_m2 INTEGER,
    size_m2 INTEGER, rooms INTEGER, bathrooms INTEGER, property_type TEXT,
    address TEXT, municipality TEXT, latitude NUMERIC, longitude NUMERIC,
    thumbnail_url TEXT, idealista_url TEXT,
    has_pool BOOLEAN, has_garage BOOLEAN, has_sea_views BOOLEAN, has_terrace BOOLEAN,
    distance_km DOUBLE PRECISION, similarity_score DOUBLE PRECISION, scraped_at TIMESTAMPTZ
  ) ON COMMIT DROP;

  TRUNCATE _fb_comps;

  -- Stage 1: Strict (2km, ±1 room, ±30% size)
  INSERT INTO _fb_comps
  SELECT * FROM find_comparables_v2(p_lat, p_lng, p_operation, p_property_type, p_size_m2, p_rooms, 2.0, p_limit);

  GET DIAGNOSTICS result_count = ROW_COUNT;

  -- Stage 2: Expand to 5km
  IF result_count < p_min_results THEN
    TRUNCATE _fb_comps;
    INSERT INTO _fb_comps
    SELECT * FROM find_comparables_v2(p_lat, p_lng, p_operation, p_property_type, p_size_m2, p_rooms, 5.0, p_limit);
    GET DIAGNOSTICS result_count = ROW_COUNT;
  END IF;

  -- Stage 3: 10km, ±2 rooms, ±40% size
  IF result_count < p_min_results THEN
    TRUNCATE _fb_comps;
    INSERT INTO _fb_comps
    SELECT
      al.id, al.property_code, al.price, al.price_per_m2,
      al.size_m2, al.rooms, al.bathrooms, al.property_type,
      al.address, al.municipality, al.latitude, al.longitude,
      al.thumbnail_url, al.idealista_url,
      al.has_pool, al.has_garage, al.has_sea_views, al.has_terrace,
      ROUND((ST_Distance(al.location_point, user_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION,
      (
        (ST_Distance(al.location_point, user_point) / 1000.0) / 10.0
        + ABS(al.size_m2 - p_size_m2)::DECIMAL / GREATEST(p_size_m2, 1) * 2.0
        + ABS(al.rooms - p_rooms) * 0.5
      )::DOUBLE PRECISION,
      al.scraped_at
    FROM active_listings al
    WHERE al.operation = p_operation
      AND al.property_type = p_property_type
      AND al.rooms BETWEEN (p_rooms - 2) AND (p_rooms + 2)
      AND al.size_m2 BETWEEN (p_size_m2 * 0.6)::INT AND (p_size_m2 * 1.4)::INT
      AND ST_DWithin(al.location_point, user_point, 10000)
    ORDER BY
      ABS(al.size_m2 - p_size_m2)::DECIMAL / GREATEST(p_size_m2, 1)
      + ABS(al.rooms - p_rooms) * 0.3
    LIMIT p_limit;
    GET DIAGNOSTICS result_count = ROW_COUNT;
  END IF;

  -- Stage 4: Same municipality, ignore radius
  IF result_count < p_min_results THEN
    TRUNCATE _fb_comps;
    INSERT INTO _fb_comps
    SELECT
      al.id, al.property_code, al.price, al.price_per_m2,
      al.size_m2, al.rooms, al.bathrooms, al.property_type,
      al.address, al.municipality, al.latitude, al.longitude,
      al.thumbnail_url, al.idealista_url,
      al.has_pool, al.has_garage, al.has_sea_views, al.has_terrace,
      ROUND((ST_Distance(al.location_point, user_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION,
      (
        ABS(al.size_m2 - p_size_m2)::DECIMAL / GREATEST(p_size_m2, 1) * 2.0
        + ABS(al.rooms - p_rooms) * 0.3
      )::DOUBLE PRECISION,
      al.scraped_at
    FROM active_listings al
    WHERE al.operation = p_operation
      AND al.property_type = p_property_type
      AND al.municipality = (
        SELECT al2.municipality FROM active_listings al2
        WHERE al2.location_point IS NOT NULL
        ORDER BY ST_Distance(al2.location_point, user_point)
        LIMIT 1
      )
      AND al.rooms BETWEEN (p_rooms - 2) AND (p_rooms + 2)
      AND al.size_m2 BETWEEN (p_size_m2 * 0.5)::INT AND (p_size_m2 * 1.5)::INT
    ORDER BY
      ABS(al.size_m2 - p_size_m2)::DECIMAL / GREATEST(p_size_m2, 1)
      + ABS(al.rooms - p_rooms) * 0.3
    LIMIT p_limit;
  END IF;

  RETURN QUERY SELECT * FROM _fb_comps;
END;
$$;
