-- Create storage bucket for order documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-documents', 'order-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Admin kan uploaden
CREATE POLICY "Admins can upload order documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-documents'
  AND auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Admin kan lezen
CREATE POLICY "Admins can read order documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-documents'
  AND auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Admin kan verwijderen
CREATE POLICY "Admins can delete order documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'order-documents'
  AND auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Klanten kunnen hun eigen documenten lezen
CREATE POLICY "Customers can read visible documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-documents'
);