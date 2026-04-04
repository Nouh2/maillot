ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS customer_user_id UUID,
ADD COLUMN IF NOT EXISTS public_tracking_token TEXT DEFAULT uuid_generate_v4()::text,
ADD COLUMN IF NOT EXISTS supplier_reference TEXT,
ADD COLUMN IF NOT EXISTS supplier_status TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_to_supplier_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS source_channel TEXT,
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_confirmation_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_email_sent_at TIMESTAMPTZ;

UPDATE orders
SET
  order_number = COALESCE(order_number, 'MA-' || UPPER(REPLACE(SUBSTRING(id::TEXT, 1, 8), '-', ''))),
  public_tracking_token = COALESCE(public_tracking_token, uuid_generate_v4()::text)
WHERE order_number IS NULL OR public_tracking_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders(order_number)
  WHERE order_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_tracking_token
  ON orders(public_tracking_token)
  WHERE public_tracking_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_user_id ON orders(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_email_sent_at ON orders(tracking_email_sent_at);
CREATE INDEX IF NOT EXISTS idx_orders_source_channel ON orders(source_channel);

CREATE TABLE IF NOT EXISTS checkout_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  source_channel TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  cart_snapshot JSONB NOT NULL DEFAULT '[]',
  recovered_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  last_checkout_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_to_brevo_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE checkout_leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checkout_leads'
      AND policyname = 'Service role manages checkout leads'
  ) THEN
    CREATE POLICY "Service role manages checkout leads"
      ON checkout_leads
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
