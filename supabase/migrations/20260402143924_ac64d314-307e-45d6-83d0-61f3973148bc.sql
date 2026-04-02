
INSERT INTO storage.buckets (id, name, public)
VALUES ('sale-photos', 'sale-photos', true);

CREATE POLICY "Sale photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'sale-photos');

CREATE POLICY "Authenticated users can upload sale photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sale-photos');

CREATE POLICY "Authenticated users can update own sale photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'sale-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own sale photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'sale-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
