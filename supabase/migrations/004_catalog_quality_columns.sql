ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_concept BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS source_provider TEXT,
ADD COLUMN IF NOT EXISTS source_album_id TEXT,
ADD COLUMN IF NOT EXISTS source_album_url TEXT,
ADD COLUMN IF NOT EXISTS source_category_key TEXT,
ADD COLUMN IF NOT EXISTS source_title TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_is_concept ON products(is_concept);
CREATE INDEX IF NOT EXISTS idx_products_source_provider ON products(source_provider);
CREATE INDEX IF NOT EXISTS idx_products_last_synced_at ON products(last_synced_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_provider_album
  ON products(source_provider, source_album_id)
  WHERE source_provider IS NOT NULL AND source_album_id IS NOT NULL;
