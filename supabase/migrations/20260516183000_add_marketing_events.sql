CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  page_path TEXT,
  page_location TEXT,
  source_channel TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  fbclid TEXT,
  ttclid TEXT,
  value NUMERIC(10, 2),
  currency TEXT,
  item_count INTEGER,
  product_id TEXT,
  product_name TEXT,
  product_ids TEXT,
  order_number TEXT,
  session_id TEXT,
  event_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'marketing_events'
      AND policyname = 'Service role manages marketing events'
  ) THEN
    CREATE POLICY "Service role manages marketing events"
      ON marketing_events
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_marketing_events_created_at ON marketing_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_events_name_created_at ON marketing_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_events_source_channel ON marketing_events(source_channel);
CREATE INDEX IF NOT EXISTS idx_marketing_events_utm_campaign ON marketing_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_events_ttclid ON marketing_events(ttclid) WHERE ttclid IS NOT NULL;
