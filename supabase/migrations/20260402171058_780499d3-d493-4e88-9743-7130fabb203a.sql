ALTER TABLE public.agent_reviews
  ADD COLUMN source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN source_url TEXT;