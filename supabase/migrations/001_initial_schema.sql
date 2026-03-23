CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leagues
CREATE TABLE leagues (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  country       TEXT NOT NULL,
  flag_emoji    TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Clubs
CREATE TABLE clubs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  league_id  UUID REFERENCES leagues(id) ON DELETE SET NULL,
  country    TEXT NOT NULL
);

-- Patches
CREATE TABLE patches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  emoji        TEXT NOT NULL,
  countries    TEXT[] DEFAULT '{}',
  competitions TEXT[] DEFAULT '{}'
);

-- Products
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  club              TEXT NOT NULL,
  league            TEXT NOT NULL,
  country           TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('domicile', 'exterieur', 'third')),
  season            TEXT NOT NULL,
  price             DECIMAL(10,2) NOT NULL,
  description       TEXT,
  sizes             TEXT[] DEFAULT '{"S","M","L","XL","XXL"}',
  available_patches TEXT[] DEFAULT '{}',
  photos            TEXT[] DEFAULT '{}',
  stock             INTEGER DEFAULT 100,
  is_active         BOOLEAN DEFAULT true,
  is_featured       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id  TEXT UNIQUE,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  customer_name      TEXT,
  customer_email     TEXT,
  customer_phone     TEXT,
  shipping_address   JSONB,
  items              JSONB NOT NULL DEFAULT '[]',
  total_amount       DECIMAL(10,2),
  telegram_notified  BOOLEAN DEFAULT false,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_club ON products(club);
CREATE INDEX idx_products_league ON products(league);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patches ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour produits, ligues, clubs, patches
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Public can read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public can read patches" ON patches FOR SELECT USING (true);

-- Orders : seul le service role peut écrire
CREATE POLICY "Service role manages orders" ON orders USING (auth.role() = 'service_role');
