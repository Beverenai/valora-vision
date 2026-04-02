
ALTER TABLE public.agent_team_members
  ADD COLUMN slug TEXT,
  ADD COLUMN bio TEXT;

ALTER TABLE public.agent_sales
  ADD COLUMN team_member_id UUID REFERENCES public.agent_team_members(id) ON DELETE SET NULL;

CREATE INDEX idx_agent_sales_team_member ON public.agent_sales(team_member_id);
CREATE UNIQUE INDEX idx_agent_team_members_slug ON public.agent_team_members(professional_id, slug);
