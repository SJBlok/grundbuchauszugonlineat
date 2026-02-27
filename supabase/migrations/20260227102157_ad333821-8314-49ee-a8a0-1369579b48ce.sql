
-- 1. Remove public read policy on daily_order_reports
DROP POLICY IF EXISTS "Allow public read access to daily reports" ON public.daily_order_reports;

-- 2. Fix storage: drop overly permissive policy, replace with admin+service-only
DROP POLICY IF EXISTS "Customers can read visible documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read order documents" ON storage.objects;

CREATE POLICY "Admins and service can read order documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-documents'
  AND (
    auth.role() = 'service_role'
    OR public.is_admin(auth.uid())
  )
);

-- 3. Add SELECT restriction on abandoned_sessions
CREATE POLICY "Only admins and service role can read abandoned sessions"
ON public.abandoned_sessions
FOR SELECT
USING (
  auth.role() = 'service_role'
  OR public.is_admin(auth.uid())
);
