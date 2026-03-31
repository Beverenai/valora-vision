
-- 1. Extend professionals table
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_photo_url text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS team_size integer,
  ADD COLUMN IF NOT EXISTS office_address text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS service_zones uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description text;

-- Generate slugs for existing rows that don't have one
UPDATE public.professionals
SET slug = lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Now make slug unique and not null
ALTER TABLE public.professionals
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS professionals_slug_unique ON public.professionals (slug);

-- 2. Create agent_team_members table
CREATE TABLE IF NOT EXISTS public.agent_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  photo_url text,
  avg_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  languages text[] DEFAULT '{}',
  email text,
  phone text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are publicly readable"
  ON public.agent_team_members FOR SELECT
  TO public USING (true);

-- 3. Create agent_reviews table
CREATE TABLE IF NOT EXISTS public.agent_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  reviewer_role text,
  rating integer NOT NULL,
  comment text,
  is_verified boolean DEFAULT false,
  lead_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON public.agent_reviews FOR SELECT
  TO public USING (true);

CREATE POLICY "Anyone can submit reviews"
  ON public.agent_reviews FOR INSERT
  TO public WITH CHECK (true);

-- Add a trigger to validate rating 1-5
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_review_rating
  BEFORE INSERT OR UPDATE ON public.agent_reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

-- 4. Create agent_contact_requests table
CREATE TABLE IF NOT EXISTS public.agent_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  interest text,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact requests"
  ON public.agent_contact_requests FOR INSERT
  TO public WITH CHECK (true);

CREATE POLICY "Service role can read contact requests"
  ON public.agent_contact_requests FOR SELECT
  TO service_role USING (true);
