
-- =============================================
-- STAGE 1: DATABASE SCHEMA ENHANCEMENT
-- ValoraCasa Backend Blueprint v3
-- =============================================

-- 1. ENHANCE ZONES TABLE with scraping config
ALTER TABLE zones ADD COLUMN IF NOT EXISTS municipality TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'Málaga';
ALTER TABLE zones ADD COLUMN IF NOT EXISTS idealista_location TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS idealista_operation TEXT DEFAULT 'sale';
ALTER TABLE zones ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'warm' CHECK (tier IN ('hot', 'warm', 'cold'));
ALTER TABLE zones ADD COLUMN IF NOT EXISTS max_items INTEGER DEFAULT 500;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS last_scrape_count INTEGER DEFAULT 0;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS last_scrape_status TEXT DEFAULT 'pending';
ALTER TABLE zones ADD COLUMN IF NOT EXISTS total_properties INTEGER DEFAULT 0;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS center_lat DECIMAL(10,7);
ALTER TABLE zones ADD COLUMN IF NOT EXISTS center_lng DECIMAL(10,7);

-- 2. CREATE SCRAPE_JOBS TABLE
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES zones(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  apify_run_id TEXT,
  items_found INTEGER,
  items_upserted INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON scrape_jobs(status) WHERE status IN ('pending', 'running');
CREATE INDEX IF NOT EXISTS idx_jobs_zone ON scrape_jobs(zone_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON scrape_jobs(created_at DESC);

-- RLS for scrape_jobs
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scrape jobs are publicly readable"
  ON scrape_jobs FOR SELECT TO public
  USING (true);

CREATE POLICY "Service role can manage scrape jobs"
  ON scrape_jobs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 3. ENSURE INDEXES on properties_for_sale
CREATE INDEX IF NOT EXISTS idx_pfs_location ON properties_for_sale USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_pfs_active ON properties_for_sale(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfs_type ON properties_for_sale(property_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfs_zone ON properties_for_sale(zone_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfs_price ON properties_for_sale(price) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfs_size ON properties_for_sale(built_size_sqm) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfs_bedrooms ON properties_for_sale(bedrooms) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfs_scraped ON properties_for_sale(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_pfs_external ON properties_for_sale(external_id);

-- Same for properties_for_rent
CREATE INDEX IF NOT EXISTS idx_pfr_location ON properties_for_rent USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_pfr_active ON properties_for_rent(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfr_type ON properties_for_rent(property_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pfr_scraped ON properties_for_rent(scraped_at DESC);

-- 4. QUEUE DUE SCRAPES FUNCTION
CREATE OR REPLACE FUNCTION queue_due_scrapes() RETURNS void AS $$
BEGIN
  -- Hot zones: every 3 days
  INSERT INTO scrape_jobs (zone_id)
  SELECT id FROM zones WHERE is_active = TRUE AND tier = 'hot'
    AND idealista_location IS NOT NULL
    AND (last_scraped_at IS NULL OR last_scraped_at < NOW() - INTERVAL '3 days')
    AND id NOT IN (SELECT zone_id FROM scrape_jobs WHERE status IN ('pending', 'running'));

  -- Warm zones: weekly
  INSERT INTO scrape_jobs (zone_id)
  SELECT id FROM zones WHERE is_active = TRUE AND tier = 'warm'
    AND idealista_location IS NOT NULL
    AND (last_scraped_at IS NULL OR last_scraped_at < NOW() - INTERVAL '7 days')
    AND id NOT IN (SELECT zone_id FROM scrape_jobs WHERE status IN ('pending', 'running'));

  -- Cold zones: every 14 days
  INSERT INTO scrape_jobs (zone_id)
  SELECT id FROM zones WHERE is_active = TRUE AND tier = 'cold'
    AND idealista_location IS NOT NULL
    AND (last_scraped_at IS NULL OR last_scraped_at < NOW() - INTERVAL '14 days')
    AND id NOT IN (SELECT zone_id FROM scrape_jobs WHERE status IN ('pending', 'running'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. DEACTIVATE STALE PROPERTIES
CREATE OR REPLACE FUNCTION deactivate_stale_properties() RETURNS void AS $$
BEGIN
  UPDATE properties_for_sale SET is_active = FALSE
  WHERE is_active = TRUE AND scraped_at < NOW() - INTERVAL '60 days';

  UPDATE properties_for_rent SET is_active = FALSE
  WHERE is_active = TRUE AND scraped_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. SYSTEM HEALTH CHECK
CREATE OR REPLACE FUNCTION system_health_check() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_sale_properties', (SELECT COUNT(*) FROM properties_for_sale),
    'active_sale_properties', (SELECT COUNT(*) FROM properties_for_sale WHERE is_active = TRUE),
    'total_rent_properties', (SELECT COUNT(*) FROM properties_for_rent),
    'active_rent_properties', (SELECT COUNT(*) FROM properties_for_rent WHERE is_active = TRUE),
    'zones_total', (SELECT COUNT(*) FROM zones WHERE is_active = TRUE),
    'zones_stale', (SELECT COUNT(*) FROM zones WHERE is_active = TRUE AND idealista_location IS NOT NULL AND (last_scraped_at IS NULL OR last_scraped_at < NOW() - INTERVAL '14 days')),
    'sell_valuations_today', (SELECT COUNT(*) FROM leads_sell WHERE created_at > NOW() - INTERVAL '1 day'),
    'buy_analyses_today', (SELECT COUNT(*) FROM buy_analyses WHERE created_at > NOW() - INTERVAL '1 day'),
    'pending_scrape_jobs', (SELECT COUNT(*) FROM scrape_jobs WHERE status = 'pending'),
    'running_scrape_jobs', (SELECT COUNT(*) FROM scrape_jobs WHERE status = 'running'),
    'failed_scrape_jobs_24h', (SELECT COUNT(*) FROM scrape_jobs WHERE status = 'failed' AND created_at > NOW() - INTERVAL '1 day'),
    'completed_scrape_jobs_24h', (SELECT COUNT(*) FROM scrape_jobs WHERE status = 'completed' AND created_at > NOW() - INTERVAL '1 day')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. REFRESH SEARCH VIEWS (placeholder — views created below)
CREATE OR REPLACE FUNCTION refresh_search_views() RETURNS void AS $$
BEGIN
  -- Will refresh materialized views once they exist
  -- For now this is a no-op that gets replaced when views are created
  RAISE NOTICE 'Views refreshed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
