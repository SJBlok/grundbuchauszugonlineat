
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'unprocessed',
  ADD COLUMN IF NOT EXISTS moneybird_invoice_id text,
  ADD COLUMN IF NOT EXISTS moneybird_invoice_status text,
  ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS processing_notes text;
