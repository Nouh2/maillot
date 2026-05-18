ALTER TABLE orders
ADD COLUMN IF NOT EXISTS ttclid TEXT;

ALTER TABLE checkout_leads
ADD COLUMN IF NOT EXISTS ttclid TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_ttclid ON orders(ttclid) WHERE ttclid IS NOT NULL;
