
-- ============================================================
-- 1. Migreer bestaande status waarden naar nieuwe statussen
-- ============================================================
UPDATE public.orders
SET status = 'open'
WHERE status = 'pending';

UPDATE public.orders
SET status = 'processed'
WHERE status = 'completed';

-- ============================================================
-- 2. Voeg een check constraint toe voor de nieuwe statussen
--    (als er nog een oude constraint bestaat, verwijder die eerst)
-- ============================================================
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN ('open', 'awaiting_customer', 'processed', 'cancelled', 'deleted')
  );

-- Update de default waarde van status naar 'open'
ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'open';

-- ============================================================
-- 3. Maak de order_status_history tabel
-- ============================================================
CREATE TABLE public.order_status_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number  text NOT NULL,
  from_status   text,
  to_status     text NOT NULL,
  changed_by    text DEFAULT 'system',
  notes         text,
  automated     boolean DEFAULT false,
  changed_at    timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Alleen service_role kan history lezen en schrijven
CREATE POLICY "Service role can manage status history"
  ON public.order_status_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index voor snelle lookups per order
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON public.order_status_history(changed_at DESC);

-- ============================================================
-- 4. Database trigger: schrijf automatisch een history entry
--    bij elke status wijziging op de orders tabel
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Alleen loggen als de status daadwerkelijk is gewijzigd
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (
      order_id,
      order_number,
      from_status,
      to_status,
      changed_by,
      automated
    ) VALUES (
      NEW.id,
      NEW.order_number,
      OLD.status,
      NEW.status,
      'api',
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();
