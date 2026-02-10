CREATE POLICY "Allow public read access to daily reports"
ON public.daily_order_reports
FOR SELECT
USING (true);