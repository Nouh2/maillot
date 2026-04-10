ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_retro BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS source_provider TEXT,
ADD COLUMN IF NOT EXISTS source_album_id TEXT,
ADD COLUMN IF NOT EXISTS source_album_url TEXT,
ADD COLUMN IF NOT EXISTS source_category_key TEXT,
ADD COLUMN IF NOT EXISTS source_title TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_is_retro ON products(is_retro);
CREATE INDEX IF NOT EXISTS idx_products_source_provider ON products(source_provider);
CREATE INDEX IF NOT EXISTS idx_products_last_synced_at ON products(last_synced_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_provider_album
  ON products(source_provider, source_album_id)
  WHERE source_provider IS NOT NULL AND source_album_id IS NOT NULL;

UPDATE leagues
SET display_order = 7
WHERE slug = 'champions-league' AND display_order = 6;

INSERT INTO leagues (slug, name, country, flag_emoji, display_order)
VALUES ('liga-portugal', 'Liga Portugal', 'Portugal', '🇵🇹', 6)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  flag_emoji = EXCLUDED.flag_emoji,
  display_order = EXCLUDED.display_order;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can read product images'
  ) THEN
    CREATE POLICY "Public can read product images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;
END $$;
