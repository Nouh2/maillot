ALTER TABLE checkout_leads
ADD COLUMN IF NOT EXISTS abandoned_cart_30m_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS abandoned_cart_6h_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS abandoned_cart_24h_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_checkout_leads_abandoned_cart_due
  ON checkout_leads(last_checkout_started_at)
  WHERE recovered_order_id IS NULL;
