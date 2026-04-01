
-- Add agency columns to professionals
ALTER TABLE public.professionals 
  ADD COLUMN agency_id uuid REFERENCES public.professionals(id) ON DELETE SET NULL,
  ADD COLUMN agency_role text DEFAULT NULL;

-- Index for fast lookups of agents belonging to an agency
CREATE INDEX idx_professionals_agency_id ON public.professionals(agency_id) WHERE agency_id IS NOT NULL;

-- Allow agency owners/admins to update the agency row
CREATE POLICY "Agency owners and admins can update agency profile"
ON public.professionals
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT p.agency_id FROM public.professionals p 
    WHERE p.user_id = auth.uid() 
    AND p.agency_role IN ('owner', 'admin')
  )
)
WITH CHECK (
  id IN (
    SELECT p.agency_id FROM public.professionals p 
    WHERE p.user_id = auth.uid() 
    AND p.agency_role IN ('owner', 'admin')
  )
);
