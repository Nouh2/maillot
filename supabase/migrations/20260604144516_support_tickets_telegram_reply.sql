CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE support_tickets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name           TEXT NOT NULL,
  customer_email          TEXT NOT NULL,
  order_number            TEXT,
  subject                 TEXT NOT NULL,
  message                 TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','awaiting_reply','reply_sent','closed')),
  telegram_chat_id        TEXT,
  telegram_message_id     BIGINT,
  reply_admin_telegram_id TEXT,
  reply_admin_name        TEXT,
  reply_subject           TEXT,
  reply_body              TEXT,
  reply_sent_at           TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_customer_email ON support_tickets(customer_email);
CREATE INDEX idx_support_tickets_reply_admin ON support_tickets(reply_admin_telegram_id, status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages support tickets"
ON support_tickets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
