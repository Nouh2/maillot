ALTER TABLE orders
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT;

ALTER TABLE checkout_leads
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON orders(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_orders_gclid ON orders(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_fbclid ON orders(fbclid) WHERE fbclid IS NOT NULL;
