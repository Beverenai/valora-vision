ALTER TABLE public.agent_team_members 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp text;