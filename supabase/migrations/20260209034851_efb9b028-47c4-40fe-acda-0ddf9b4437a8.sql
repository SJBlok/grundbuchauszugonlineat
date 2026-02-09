-- Update default product_price for orders table
ALTER TABLE public.orders ALTER COLUMN product_price SET DEFAULT 29.95;

-- Update default product_price for abandoned_sessions table
ALTER TABLE public.abandoned_sessions ALTER COLUMN product_price SET DEFAULT 29.95;