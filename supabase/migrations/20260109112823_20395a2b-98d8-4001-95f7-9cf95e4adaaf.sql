-- Allow service role to update orders (for edge function)
CREATE POLICY "Service role can update orders"
ON public.orders
FOR UPDATE
USING (true)
WITH CHECK (true);