ALTER TABLE products
ADD COLUMN IF NOT EXISTS jersey_version TEXT NOT NULL DEFAULT 'fan';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_jersey_version_check'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_jersey_version_check
    CHECK (jersey_version IN ('fan', 'player'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_jersey_version ON products(jersey_version);
