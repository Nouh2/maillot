ALTER TABLE products
ADD COLUMN IF NOT EXISTS manual_override JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS manual_override_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_manual_override_updated_at
  ON products(manual_override_updated_at);
