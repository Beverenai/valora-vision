CREATE TABLE public.buy_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_a_id UUID REFERENCES public.buy_analyses(id),
  analysis_b_id UUID REFERENCES public.buy_analyses(id),
  ai_comparison TEXT,
  ai_winner TEXT,
  ai_comparison_points JSONB,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buy_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create buy comparisons"
  ON public.buy_comparisons FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can read buy comparisons"
  ON public.buy_comparisons FOR SELECT TO public USING (true);

CREATE POLICY "Service role can update buy comparisons"
  ON public.buy_comparisons FOR UPDATE TO public USING (true) WITH CHECK (true);