-- Add document_visible column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS document_visible BOOLEAN DEFAULT false;