
-- ============================================================
-- 1. UNIFIED PROPERTIES TABLE
-- ============================================================
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_code TEXT NOT NULL,
  operation TEXT NOT NULL,

  -- Location
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  location_point GEOGRAPHY(POINT, 4326),
  address TEXT,
  province TEXT,
  municipality TEXT,
  district TEXT,
  location_id TEXT,

  -- Price
  price INTEGER NOT NULL,
  price_per_m2 INTEGER,

  -- Property specs
  property_type TEXT,
  size_m2 INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  floor TEXT,
  condition TEXT,

  -- Features (booleans)
  has_pool BOOLEAN DEFAULT FALSE,
  has_garage BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT FALSE,
  has_garden BOOLEAN DEFAULT FALSE,
  has_lift BOOLEAN DEFAULT FALSE,
  has_ac BOOLEAN DEFAULT FALSE,
  has_sea_views BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_storage BOOLEAN DEFAULT FALSE,
  is_exterior BOOLEAN DEFAULT FALSE,

  -- Metadata
  description TEXT,
  thumbnail_url TEXT,
  images JSONB,
  idealista_url TEXT,

  -- Agency info
  agency_name TEXT,
  agency_logo TEXT,
  agency_phone TEXT,

  -- Stats
  views_count INTEGER,
  favorites_count INTEGER,

  -- Timestamps
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  listed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Zone reference
  zone_id UUID REFERENCES public.zones(id),

  -- Source tracking
  source TEXT DEFAULT 'idealista',

  -- Unique constraint
  UNIQUE(property_code, source)
);

-- Trigger for auto-updating location_point
CREATE OR REPLACE FUNCTION public.update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_location_point
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_location_point();

-- Indexes
CREATE INDEX idx_properties_location ON public.properties USING GIST (location_point);
CREATE INDEX idx_properties_operation ON public.properties (operation);
CREATE INDEX idx_properties_type ON public.properties (property_type);
CREATE INDEX idx_properties_rooms ON public.properties (rooms);
CREATE INDEX idx_properties_municipality ON public.properties (municipality);
CREATE INDEX idx_properties_scraped ON public.properties (scraped_at);
CREATE INDEX idx_properties_zone ON public.properties (zone_id);

-- RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are publicly readable"
ON public.properties FOR SELECT TO public USING (true);

-- ============================================================
-- 2. VALUATIONS TABLE
-- ============================================================
CREATE TABLE public.valuations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User property details
  address TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  property_type TEXT NOT NULL,
  size_m2 INTEGER NOT NULL,
  rooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  floor TEXT,
  condition TEXT,
  has_pool BOOLEAN DEFAULT FALSE,
  has_garage BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT FALSE,
  has_garden BOOLEAN DEFAULT FALSE,
  has_lift BOOLEAN DEFAULT FALSE,
  has_ac BOOLEAN DEFAULT FALSE,
  has_sea_views BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,

  -- Valuation results
  estimated_value INTEGER,
  estimated_value_low INTEGER,
  estimated_value_high INTEGER,
  price_per_m2 INTEGER,
  comparable_count INTEGER,

  -- Rental estimates
  monthly_rent_estimate INTEGER,
  annual_rent_estimate INTEGER,
  rental_yield_percent DECIMAL(4, 2),

  -- Market context
  area_avg_price_m2 INTEGER,
  area_price_trend TEXT,

  -- Type
  valuation_type TEXT,

  -- Contact (lead)
  email TEXT,
  phone TEXT,
  name TEXT,

  -- AI analysis
  analysis TEXT,
  market_trends TEXT,

  -- Status
  status TEXT DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create valuations"
ON public.valuations FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can read valuations"
ON public.valuations FOR SELECT TO public USING (true);

CREATE POLICY "Service role can update valuations"
ON public.valuations FOR UPDATE TO public USING (true) WITH CHECK (true);

-- ============================================================
-- 3. VALUATION_COMPARABLES TABLE
-- ============================================================
CREATE TABLE public.valuation_comparables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  valuation_id UUID REFERENCES public.valuations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  similarity_score DECIMAL(5, 2),
  distance_km DECIMAL(6, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.valuation_comparables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Valuation comparables are publicly readable"
ON public.valuation_comparables FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert valuation comparables"
ON public.valuation_comparables FOR INSERT TO public WITH CHECK (true);

-- ============================================================
-- 4. UNIFIED find_comparables RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.find_comparables(
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
  latitude DECIMAL,
  longitude DECIMAL,
  thumbnail_url TEXT,
  idealista_url TEXT,
  agency_name TEXT,
  distance_km DECIMAL,
  has_pool BOOLEAN,
  has_garage BOOLEAN,
  has_terrace BOOLEAN,
  has_sea_views BOOLEAN,
  scraped_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.property_code,
    p.price,
    p.price_per_m2,
    p.size_m2,
    p.rooms,
    p.bathrooms,
    p.property_type,
    p.address,
    p.municipality,
    p.latitude,
    p.longitude,
    p.thumbnail_url,
    p.idealista_url,
    p.agency_name,
    ROUND((ST_Distance(
      p.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::DECIMAL, 2) AS distance_km,
    p.has_pool,
    p.has_garage,
    p.has_terrace,
    p.has_sea_views,
    p.scraped_at
  FROM public.properties p
  WHERE p.operation = p_operation
    AND p.property_type = p_property_type
    AND p.rooms BETWEEN (p_rooms - 1) AND (p_rooms + 1)
    AND p.size_m2 BETWEEN (p_size_m2 * 0.7)::INTEGER AND (p_size_m2 * 1.3)::INTEGER
    AND ST_DWithin(
      p.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
    AND p.scraped_at > NOW() - INTERVAL '60 days'
    AND p.price > 0
    AND p.size_m2 > 0
  ORDER BY
    ST_Distance(p.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
    + ABS(p.size_m2 - p_size_m2) * 50
    + ABS(p.rooms - p_rooms) * 500
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. MIGRATE DATA from old tables into properties
-- ============================================================

-- Sale properties
INSERT INTO public.properties (
  property_code, operation, latitude, longitude, address, municipality,
  price, price_per_m2, property_type, size_m2, rooms, bathrooms,
  description, images, idealista_url, zone_id, source, scraped_at, created_at
)
SELECT
  external_id, 'sale',
  latitude::DECIMAL(10,7), longitude::DECIMAL(10,7),
  address, city,
  price::INTEGER, price_per_sqm::INTEGER,
  property_type, built_size_sqm::INTEGER, bedrooms, bathrooms,
  description,
  CASE WHEN image_urls IS NOT NULL THEN to_jsonb(image_urls) ELSE NULL END,
  listing_url, zone_id, source, scraped_at, created_at
FROM public.properties_for_sale
WHERE external_id IS NOT NULL
ON CONFLICT (property_code, source) DO NOTHING;

-- Rent properties
INSERT INTO public.properties (
  property_code, operation, latitude, longitude, address, municipality,
  price, price_per_m2, property_type, size_m2, rooms, bathrooms,
  description, images, idealista_url, zone_id, source, scraped_at, created_at
)
SELECT
  external_id, 'rent',
  latitude::DECIMAL(10,7), longitude::DECIMAL(10,7),
  address, city,
  monthly_rent::INTEGER, rent_per_sqm::INTEGER,
  property_type, built_size_sqm::INTEGER, bedrooms, bathrooms,
  description,
  CASE WHEN image_urls IS NOT NULL THEN to_jsonb(image_urls) ELSE NULL END,
  listing_url, zone_id, source, scraped_at, created_at
FROM public.properties_for_rent
WHERE external_id IS NOT NULL
ON CONFLICT (property_code, source) DO NOTHING;
