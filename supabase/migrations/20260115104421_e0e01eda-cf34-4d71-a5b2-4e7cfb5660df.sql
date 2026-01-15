-- Add address fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS adresse text,
ADD COLUMN IF NOT EXISTS plz text,
ADD COLUMN IF NOT EXISTS ort text;