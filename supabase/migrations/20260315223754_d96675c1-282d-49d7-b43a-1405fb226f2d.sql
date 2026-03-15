
-- ============================================
-- ValoraCasa Database Schema
-- ============================================

-- 1. ZONES
CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  region text NOT NULL,
  country text NOT NULL DEFAULT 'Spain',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zones are publicly readable" ON public.zones
  FOR SELECT USING (true);

-- 2. PROPERTIES FOR SALE
CREATE TABLE public.properties_for_sale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  source text NOT NULL,
  title text,
  price numeric NOT NULL,
  price_per_sqm numeric,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  built_size_sqm numeric,
  plot_size_sqm numeric,
  terrace_size_sqm numeric,
  address text,
  city text NOT NULL,
  zone_id uuid REFERENCES public.zones(id),
  latitude numeric,
  longitude numeric,
  description text,
  features text[],
  image_urls text[],
  listing_url text,
  listed_date date,
  is_active boolean DEFAULT true,
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pfs_zone_id ON public.properties_for_sale(zone_id);
CREATE INDEX idx_pfs_city ON public.properties_for_sale(city);
CREATE INDEX idx_pfs_property_type ON public.properties_for_sale(property_type);
CREATE INDEX idx_pfs_price ON public.properties_for_sale(price);
CREATE INDEX idx_pfs_bedrooms ON public.properties_for_sale(bedrooms);
CREATE INDEX idx_pfs_built_size ON public.properties_for_sale(built_size_sqm);

ALTER TABLE public.properties_for_sale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sale properties are publicly readable" ON public.properties_for_sale
  FOR SELECT USING (true);

-- 3. PROPERTIES FOR RENT
CREATE TABLE public.properties_for_rent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  source text NOT NULL,
  title text,
  monthly_rent numeric NOT NULL,
  rent_per_sqm numeric,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  built_size_sqm numeric,
  plot_size_sqm numeric,
  terrace_size_sqm numeric,
  address text,
  city text NOT NULL,
  zone_id uuid REFERENCES public.zones(id),
  latitude numeric,
  longitude numeric,
  description text,
  features text[],
  image_urls text[],
  listing_url text,
  listed_date date,
  is_furnished text CHECK (is_furnished IN ('furnished', 'unfurnished', 'partially_furnished')),
  rental_type text CHECK (rental_type IN ('long_term', 'short_term', 'both')),
  is_active boolean DEFAULT true,
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pfr_zone_id ON public.properties_for_rent(zone_id);
CREATE INDEX idx_pfr_city ON public.properties_for_rent(city);
CREATE INDEX idx_pfr_property_type ON public.properties_for_rent(property_type);
CREATE INDEX idx_pfr_monthly_rent ON public.properties_for_rent(monthly_rent);
CREATE INDEX idx_pfr_bedrooms ON public.properties_for_rent(bedrooms);
CREATE INDEX idx_pfr_built_size ON public.properties_for_rent(built_size_sqm);

ALTER TABLE public.properties_for_rent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rental properties are publicly readable" ON public.properties_for_rent
  FOR SELECT USING (true);

-- 4. SHORT TERM RENTALS
CREATE TABLE public.short_term_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  source text,
  title text,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  city text NOT NULL,
  zone_id uuid REFERENCES public.zones(id),
  avg_daily_rate numeric,
  avg_weekly_rate numeric,
  avg_monthly_rate numeric,
  occupancy_rate numeric,
  high_season_daily_rate numeric,
  low_season_daily_rate numeric,
  annual_revenue numeric,
  review_count integer,
  rating numeric,
  latitude numeric,
  longitude numeric,
  scraped_at timestamptz DEFAULT now()
);

ALTER TABLE public.short_term_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Short term rentals are publicly readable" ON public.short_term_rentals
  FOR SELECT USING (true);

-- 5. PROFESSIONALS
CREATE TABLE public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('agent', 'property_manager')),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  website text,
  bio text,
  photo_url text,
  logo_url text,
  languages text[],
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals are publicly readable" ON public.professionals
  FOR SELECT USING (true);

-- 6. PROFESSIONAL ZONES
CREATE TABLE public.professional_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES public.professionals(id) NOT NULL,
  zone_id uuid REFERENCES public.zones(id) NOT NULL,
  tier text NOT NULL CHECK (tier IN ('premium', 'featured', 'listed')),
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (professional_id, zone_id)
);

ALTER TABLE public.professional_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional zones are publicly readable" ON public.professional_zones
  FOR SELECT USING (true);

-- 7. LEADS SELL
CREATE TABLE public.leads_sell (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text NOT NULL,
  city text,
  zone_id uuid REFERENCES public.zones(id),
  property_type text,
  built_size_sqm numeric,
  plot_size_sqm numeric,
  terrace_size_sqm numeric,
  bedrooms integer,
  bathrooms integer,
  orientation text,
  views text,
  condition text,
  features text,
  year_built integer,
  energy_certificate text,
  estimated_value numeric,
  price_range_low numeric,
  price_range_high numeric,
  price_per_sqm numeric,
  monthly_rental_estimate numeric,
  analysis text,
  market_trends text,
  comparable_properties jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads_sell ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sell leads" ON public.leads_sell
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read sell leads" ON public.leads_sell
  FOR SELECT TO authenticated USING (true);

-- 8. LEADS RENT
CREATE TABLE public.leads_rent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text NOT NULL,
  city text,
  zone_id uuid REFERENCES public.zones(id),
  property_type text,
  built_size_sqm numeric,
  bedrooms integer,
  bathrooms integer,
  is_furnished text,
  rental_preference text CHECK (rental_preference IN ('long_term', 'short_term', 'both')),
  current_rental_income numeric,
  availability_date date,
  monthly_long_term_estimate numeric,
  weekly_high_season_estimate numeric,
  weekly_low_season_estimate numeric,
  annual_income_estimate numeric,
  occupancy_estimate numeric,
  seasonal_breakdown jsonb,
  analysis text,
  comparable_rentals jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads_rent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create rent leads" ON public.leads_rent
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read rent leads" ON public.leads_rent
  FOR SELECT TO authenticated USING (true);

-- 9. VALUATION FEEDBACK
CREATE TABLE public.valuation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type text NOT NULL CHECK (lead_type IN ('sell', 'rent')),
  lead_id uuid NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  actual_value numeric,
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.valuation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback" ON public.valuation_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read feedback" ON public.valuation_feedback
  FOR SELECT TO authenticated USING (true);

-- 10. PROFESSIONAL IMPRESSIONS
CREATE TABLE public.professional_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES public.professionals(id) NOT NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('sell', 'rent')),
  lead_id uuid NOT NULL,
  zone_id uuid REFERENCES public.zones(id),
  position integer,
  was_clicked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pi_professional_id ON public.professional_impressions(professional_id);
CREATE INDEX idx_pi_zone_id ON public.professional_impressions(zone_id);
CREATE INDEX idx_pi_created_at ON public.professional_impressions(created_at);

ALTER TABLE public.professional_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create impressions" ON public.professional_impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read impressions" ON public.professional_impressions
  FOR SELECT TO authenticated USING (true);
