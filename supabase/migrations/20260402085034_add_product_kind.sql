ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_kind TEXT NOT NULL DEFAULT 'jersey';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_product_kind_check'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_product_kind_check
    CHECK (
      product_kind IN (
        'jersey',
        'goalkeeper',
        'training',
        'pre_match',
        'lifestyle',
        'jacket',
        'pants',
        'shorts',
        'set',
        'vest'
      )
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_product_kind ON products(product_kind);
