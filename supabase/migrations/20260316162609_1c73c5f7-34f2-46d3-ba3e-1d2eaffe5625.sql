
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location_point to properties_for_sale
ALTER TABLE properties_for_sale ADD COLUMN IF NOT EXISTS location_point GEOGRAPHY(POINT, 4326);

-- Add location_point to properties_for_rent
ALTER TABLE properties_for_rent ADD COLUMN IF NOT EXISTS location_point GEOGRAPHY(POINT, 4326);

-- Trigger function to auto-populate location_point
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on properties_for_sale
CREATE TRIGGER trg_sale_location_point
BEFORE INSERT OR UPDATE ON properties_for_sale
FOR EACH ROW EXECUTE FUNCTION update_location_point();

-- Trigger on properties_for_rent
CREATE TRIGGER trg_rent_location_point
BEFORE INSERT OR UPDATE ON properties_for_rent
FOR EACH ROW EXECUTE FUNCTION update_location_point();

-- Backfill existing rows
UPDATE properties_for_sale
SET location_point = ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location_point IS NULL;

UPDATE properties_for_rent
SET location_point = ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location_point IS NULL;

-- GIST indexes for geo queries
CREATE INDEX IF NOT EXISTS idx_sale_location ON properties_for_sale USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_rent_location ON properties_for_rent USING GIST (location_point);

-- Add status column to leads_sell and leads_rent
ALTER TABLE leads_sell ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE leads_rent ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add anonymous SELECT policy on leads_sell by ID
CREATE POLICY "Anyone can read sell leads by id"
ON leads_sell FOR SELECT TO public
USING (true);

-- Add anonymous SELECT policy on leads_rent by ID
CREATE POLICY "Anyone can read rent leads by id"
ON leads_rent FOR SELECT TO public
USING (true);

-- Allow service role to update leads
CREATE POLICY "Service role can update sell leads"
ON leads_sell FOR UPDATE TO public
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can update rent leads"
ON leads_rent FOR UPDATE TO public
USING (true) WITH CHECK (true);

-- scrape_zones table for future Apify scheduling
CREATE TABLE IF NOT EXISTS scrape_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  location_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('hot', 'warm', 'cold', 'ondemand')),
  last_scraped_at TIMESTAMPTZ,
  scrape_interval_days INTEGER DEFAULT 7,
  property_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scrape_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scrape zones are publicly readable"
ON scrape_zones FOR SELECT TO public
USING (true);

-- RPC: find_sale_comparables
CREATE OR REPLACE FUNCTION find_sale_comparables(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_property_type TEXT,
  p_size_m2 INTEGER,
  p_rooms INTEGER,
  p_radius_km DECIMAL DEFAULT 3.0,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  price NUMERIC,
  price_per_sqm NUMERIC,
  built_size_sqm NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT,
  address TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  image_urls TEXT[],
  listing_url TEXT,
  features TEXT[],
  distance_km DECIMAL,
  scraped_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.price,
    p.price_per_sqm,
    p.built_size_sqm,
    p.bedrooms,
    p.bathrooms,
    p.property_type,
    p.address,
    p.city,
    p.latitude,
    p.longitude,
    p.image_urls,
    p.listing_url,
    p.features,
    ROUND((ST_Distance(
      p.location_point,
      ST_SetSRID(ST_MakePoint(p_lng::float, p_lat::float), 4326)::geography
    ) / 1000)::DECIMAL, 2) AS distance_km,
    p.scraped_at
  FROM properties_for_sale p
  WHERE p.property_type = p_property_type
    AND p.bedrooms BETWEEN GREATEST(1, p_rooms - 1) AND (p_rooms + 1)
    AND p.built_size_sqm BETWEEN (p_size_m2 * 0.7) AND (p_size_m2 * 1.3)
    AND ST_DWithin(
      p.location_point,
      ST_SetSRID(ST_MakePoint(p_lng::float, p_lat::float), 4326)::geography,
      p_radius_km * 1000
    )
    AND p.scraped_at > NOW() - INTERVAL '90 days'
    AND p.price > 0
    AND p.built_size_sqm > 0
  ORDER BY
    ST_Distance(p.location_point, ST_SetSRID(ST_MakePoint(p_lng::float, p_lat::float), 4326)::geography)
    + ABS(p.built_size_sqm - p_size_m2) * 50
    + ABS(COALESCE(p.bedrooms, p_rooms) - p_rooms) * 500
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- RPC: find_rent_comparables
CREATE OR REPLACE FUNCTION find_rent_comparables(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_property_type TEXT,
  p_size_m2 INTEGER,
  p_rooms INTEGER,
  p_radius_km DECIMAL DEFAULT 3.0,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  monthly_rent NUMERIC,
  rent_per_sqm NUMERIC,
  built_size_sqm NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT,
  address TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  image_urls TEXT[],
  listing_url TEXT,
  features TEXT[],
  distance_km DECIMAL,
  scraped_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.monthly_rent,
    p.rent_per_sqm,
    p.built_size_sqm,
    p.bedrooms,
    p.bathrooms,
    p.property_type,
    p.address,
    p.city,
    p.latitude,
    p.longitude,
    p.image_urls,
    p.listing_url,
    p.features,
    ROUND((ST_Distance(
      p.location_point,
      ST_SetSRID(ST_MakePoint(p_lng::float, p_lat::float), 4326)::geography
    ) / 1000)::DECIMAL, 2) AS distance_km,
    p.scraped_at
  FROM properties_for_rent p
  WHERE p.property_type = p_property_type
    AND p.bedrooms BETWEEN GREATEST(1, p_rooms - 1) AND (p_rooms + 1)
    AND p.built_size_sqm BETWEEN (p_size_m2 * 0.7) AND (p_size_m2 * 1.3)
    AND ST_DWithin(
      p.location_point,
      ST_SetSRID(ST_MakePoint(p_lng::float, p_lat::float), 4326)::geography,
      p_radius_km * 1000
    )
    AND p.scraped_at > NOW() - INTERVAL '90 days'
    AND p.monthly_rent > 0
    AND p.built_size_sqm > 0
  ORDER BY
    ST_Distance(p.location_point, ST_SetSRID(ST_MakePoint(p_lng::float, p_lat::float), 4326)::geography)
    + ABS(p.built_size_sqm - p_size_m2) * 50
    + ABS(COALESCE(p.bedrooms, p_rooms) - p_rooms) * 500
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
