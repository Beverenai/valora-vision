
-- Drop existing triggers and recreate
DROP TRIGGER IF EXISTS trg_sale_location_point ON public.properties_for_sale;
DROP TRIGGER IF EXISTS trg_rent_location_point ON public.properties_for_rent;

CREATE OR REPLACE FUNCTION public.set_location_point()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sale_location_point
BEFORE INSERT OR UPDATE ON public.properties_for_sale
FOR EACH ROW EXECUTE FUNCTION public.set_location_point();

CREATE TRIGGER trg_rent_location_point
BEFORE INSERT OR UPDATE ON public.properties_for_rent
FOR EACH ROW EXECUTE FUNCTION public.set_location_point();
