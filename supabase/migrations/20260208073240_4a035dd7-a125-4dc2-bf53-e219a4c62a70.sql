-- Create table for daily order reports
CREATE TABLE public.daily_order_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  orders_count INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  orders_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_order_reports ENABLE ROW LEVEL SECURITY;

-- Only service role can manage reports
CREATE POLICY "Service role can manage daily reports"
ON public.daily_order_reports
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create index for fast date lookups
CREATE INDEX idx_daily_order_reports_date ON public.daily_order_reports(report_date DESC);