-- Create the trigger for automatic order number generation
-- The function already exists, just need to create the trigger

CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();