-- Allow service role to delete orders (needed for delete-order edge function)
-- The existing "Service role can manage orders" policy already covers ALL commands with USING(true),
-- but it's RESTRICTIVE. We need a PERMISSIVE policy for DELETE to work properly.

-- Also allow admins to delete orders
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow service role delete via a permissive policy
CREATE POLICY "Service role can delete orders"
ON public.orders
FOR DELETE
USING (auth.role() = 'service_role'::text);
