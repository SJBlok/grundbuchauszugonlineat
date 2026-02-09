-- Update default product_price to 29.90 for orders table
ALTER TABLE public.orders ALTER COLUMN product_price SET DEFAULT 29.90;

-- Update default product_price to 29.90 for abandoned_sessions table
ALTER TABLE public.abandoned_sessions ALTER COLUMN product_price SET DEFAULT 29.90;