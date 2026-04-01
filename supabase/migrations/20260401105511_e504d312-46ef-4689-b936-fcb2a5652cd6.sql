
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-logos', 'agent-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view agent logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agent-logos');

CREATE POLICY "Authenticated users can upload agent logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-logos');

CREATE POLICY "Authenticated users can update own agent logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'agent-logos')
WITH CHECK (bucket_id = 'agent-logos');

CREATE POLICY "Authenticated users can delete own agent logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'agent-logos');
