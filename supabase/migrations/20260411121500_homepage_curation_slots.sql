CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS homepage_curation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('top_moment', 'fast_movers')),
  group_key TEXT NOT NULL,
  slot_index INTEGER NOT NULL CHECK (slot_index >= 0),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section, group_key, slot_index)
);

CREATE INDEX IF NOT EXISTS idx_homepage_curation_slots_section_group
  ON homepage_curation_slots(section, group_key);

CREATE INDEX IF NOT EXISTS idx_homepage_curation_slots_product_id
  ON homepage_curation_slots(product_id);

ALTER TABLE homepage_curation_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read homepage curation slots"
  ON homepage_curation_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Service role manages homepage curation slots"
  ON homepage_curation_slots
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
