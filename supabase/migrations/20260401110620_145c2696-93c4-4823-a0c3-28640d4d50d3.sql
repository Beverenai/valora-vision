
-- Add is_active column for soft-deletion
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add FK constraint to zones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_properties_zone' AND table_name = 'properties'
  ) THEN
    ALTER TABLE properties ADD CONSTRAINT fk_properties_zone FOREIGN KEY (zone_id) REFERENCES zones(id);
  END IF;
END $$;

-- New indexes for the layer architecture
CREATE INDEX IF NOT EXISTS idx_prop_zone ON properties(zone_id);
CREATE INDEX IF NOT EXISTS idx_prop_active ON properties(is_active, operation);
