-- Fix: Convert the INSERT policy to PERMISSIVE (default) instead of RESTRICTIVE
-- The current "Anyone can create orders" policy is RESTRICTIVE which blocks inserts

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Recreate as PERMISSIVE (which is the default when not specifying RESTRICTIVE)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);