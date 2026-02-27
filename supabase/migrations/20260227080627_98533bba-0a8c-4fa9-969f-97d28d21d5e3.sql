
-- 1. Admin users tabel aanmaken
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin status (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  )
$$;

-- Admin users: alleen admins kunnen deze tabel lezen (via security definer)
CREATE POLICY "Admins can read admin_users"
ON public.admin_users FOR SELECT
USING (public.is_admin(auth.uid()));

-- 2. Orders: admin mag ALLE orders lezen
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin(auth.uid()));

-- 3. Orders: admin mag orders updaten
CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. Daily order reports: admin mag lezen
CREATE POLICY "Admins can view daily reports"
ON public.daily_order_reports FOR SELECT
USING (public.is_admin(auth.uid()));

-- 5. Order status history: admin mag lezen
CREATE POLICY "Admins can view order status history"
ON public.order_status_history FOR SELECT
USING (public.is_admin(auth.uid()));
