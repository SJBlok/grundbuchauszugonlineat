
ALTER TABLE public.orders 
ADD COLUMN digital_storage_subscription boolean NOT NULL DEFAULT false;

ALTER TABLE public.abandoned_sessions 
ADD COLUMN digital_storage_subscription boolean DEFAULT false;
