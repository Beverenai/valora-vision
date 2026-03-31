
ALTER TABLE public.agent_contact_requests 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

CREATE POLICY "Agents can read own contact requests"
ON public.agent_contact_requests FOR SELECT TO authenticated
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Agents can update own contact requests"
ON public.agent_contact_requests FOR UPDATE TO authenticated
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
))
WITH CHECK (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));
