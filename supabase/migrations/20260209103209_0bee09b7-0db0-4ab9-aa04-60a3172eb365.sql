-- Update default product_price to 29.88 for orders table
ALTER TABLE public.orders ALTER COLUMN product_price SET DEFAULT 29.88;

-- Update default product_price to 29.88 for abandoned_sessions table
ALTER TABLE public.abandoned_sessions ALTER COLUMN product_price SET DEFAULT 29.88;