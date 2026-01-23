-- Fix 1: Drop the overly permissive "Anyone can view orders" policy
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Fix 2: Drop and recreate the "Service role can update orders" policy with proper role check
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;

CREATE POLICY "Service role can update orders"
ON public.orders
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Fix 3: Add a policy to allow users to view only their own orders by email
-- This uses auth.jwt() to get the email claim from the JWT token
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  -- Allow service role to view all orders
  auth.role() = 'service_role'
  OR
  -- Allow users to view orders matching their email (when authenticated)
  (auth.jwt() IS NOT NULL AND email = auth.jwt()->>'email')
);

-- Fix 4: Drop the overly permissive abandoned_sessions policy and recreate with proper restrictions
DROP POLICY IF EXISTS "Service role can manage abandoned sessions" ON public.abandoned_sessions;

-- Only service role can manage abandoned sessions (for edge functions)
CREATE POLICY "Service role can manage abandoned sessions"
ON public.abandoned_sessions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');