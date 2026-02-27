-- Admins can manage order_status_history (all operations)
CREATE POLICY "Admins can manage order status history"
ON public.order_status_history FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));