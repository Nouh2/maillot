# KITLAB — Football Jersey E-Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready French e-commerce site (~390 football jerseys) with Supabase database, Stripe Checkout, and Telegram order notifications.

**Architecture:** Next.js 16 App Router — Server Components for SSG/ISR catalog pages, Client Components for interactive cart/filters, Supabase (postgres + storage) for all data, Route Handler webhook for Stripe event processing + Telegram notifications. Custom design system (terracotta/cream palette, Bebas Neue + Barlow typography) with Tailwind CSS v4 utility classes.

**Tech Stack:** Next.js 16.1 (NOT 14 as in brief — upgraded for security patches CVE-2025-66478 etc.), TypeScript 5.5+, Tailwind CSS v4, Supabase JS v2 (@supabase/ssr), Stripe (stripe@latest + @stripe/stripe-js), Zustand v5, next/font/google

> **⚠️ Note on Next.js version:** Brief specifies Next.js 14 but we use Next.js 16.1 (latest stable). Next.js 14.x has critical CVEs (RCE, DoS) patched only in 16.x. Same App Router API — all patterns from the brief apply directly.

---

## File Map

```
src/
├── app/
│   ├── layout.tsx                        # Root layout — fonts, providers, navbar, footer
│   ├── page.tsx                          # Homepage — all sections
│   ├── shop/
│   │   ├── page.tsx                      # Catalogue with filters
│   │   └── [slug]/page.tsx               # Fiche produit
│   ├── ligue/[slug]/page.tsx             # Products by league
│   ├── club/[slug]/page.tsx              # Products by club
│   ├── order-confirmed/page.tsx          # Post-payment confirmation
│   ├── account/page.tsx                  # Customer orders history
│   ├── faq/page.tsx
│   ├── suivi/page.tsx
│   ├── legal/
│   │   ├── cgv/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   └── confidentialite/page.tsx
│   └── api/
│       ├── webhooks/stripe/route.ts      # Stripe webhook → Supabase + Telegram
│       ├── checkout/route.ts             # Create Stripe Checkout session
│       └── products/route.ts            # Public products API (search)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                   # 'use client' — nav + panier badge
│   │   ├── Footer.tsx                   # Server component
│   │   └── Ticker.tsx                   # CSS animation, client
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── LeaguesStrip.tsx
│   │   ├── WhyUsSection.tsx
│   │   ├── PatchesBanner.tsx
│   │   ├── ClubsGrid.tsx
│   │   ├── ReviewsSection.tsx
│   │   └── ReassuranceBar.tsx
│   ├── products/
│   │   ├── ProductCard.tsx              # 'use client' — hover state
│   │   ├── ProductsGrid.tsx             # Server — fetches + renders grid
│   │   ├── FilterSidebar.tsx            # 'use client' — URL search params
│   │   ├── SortBar.tsx                  # 'use client'
│   │   ├── PhotoGallery.tsx             # 'use client' — photo switcher
│   │   ├── SizeSelector.tsx             # 'use client'
│   │   ├── PatchSelector.tsx            # 'use client'
│   │   └── AddToCartForm.tsx            # 'use client' — size+patch+cart logic
│   ├── cart/
│   │   ├── CartDrawer.tsx               # 'use client' — slide-in panel
│   │   ├── CartItem.tsx
│   │   └── CartButton.tsx               # Nav panier icon + badge
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── SectionTitle.tsx
│   │   └── ScrollReveal.tsx             # IntersectionObserver wrapper
│   └── providers/
│       └── Providers.tsx                # 'use client' — wraps Zustand + any context
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client (lazy)
│   │   ├── server.ts                    # Server Supabase client (lazy, SSR cookies)
│   │   └── queries.ts                   # All DB query functions
│   ├── stripe.ts                        # Stripe server client (lazy singleton)
│   ├── telegram.ts                      # sendTelegramNotification()
│   └── formatOrder.ts                   # Message formatter for Telegram
├── store/
│   └── cart.ts                          # Zustand cart store
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── cart.ts
└── styles/
    └── globals.css                      # Tailwind + custom CSS variables + fonts
```

---

## Phase 1: Project Setup & Foundation

### Task 1.1: Scaffold Next.js 16 App

**Files:**
- Create: entire project scaffold via create-next-app
- Modify: `package.json` — add dependencies
- Modify: `src/styles/globals.css` — design system variables
- Create: `.env.local`

- [ ] **Step 1: Scaffold the project**

```bash
cd C:\Users\noete\Desktop\Maillot
npx create-next-app@latest . --yes --force --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js zustand
npm install @types/node
```

- [ ] **Step 3: Install Google Fonts**

No npm install needed — use `next/font/google` (built-in). Skip this step.

- [ ] **Step 4: Create `.env.local`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Telegram
TELEGRAM_BOT_TOKEN=7xxxxxxxxxx:AAF...
TELEGRAM_CHAT_ID=-100xxxxxxxxxx

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=KITLAB
```

- [ ] **Step 5: Set up design system in `src/styles/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: "Barlow", "Barlow Fallback", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
}

:root {
  --cream:     #faf7f2;
  --cream-2:   #f3ede3;
  --cream-3:   #e8dfd0;
  --cream-4:   #ddd0be;
  --black:     #1c1712;
  --black-2:   #2e2820;
  --black-3:   #3f3830;
  --grey:      #7a6f62;
  --grey-lt:   #a89f92;
  --terra:     #c1440e;
  --terra-2:   #a83a0c;
  --terra-3:   #d4581f;
  --terra-lt:  #fdf0ea;
  --terra-mid: #e8956d;
  --white:     #ffffff;
}

body {
  background-color: var(--cream);
  color: var(--black);
}

/* Custom cursor — desktop only */
@media (pointer: fine) {
  * { cursor: none; }
  .cursor-dot {
    width: 8px; height: 8px;
    background: var(--terra);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s;
  }
  .cursor-ring {
    width: 32px; height: 32px;
    border: 2px solid var(--terra);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: transform 0.15s ease-out;
  }
}

/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Ticker animation */
@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-track {
  animation: ticker 30s linear infinite;
}
```

- [ ] **Step 6: Set up fonts in `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, Bebas_Neue } from 'next/font/google'
import '@/styles/globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-barlow',
})
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-barlow-condensed',
})
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: { default: 'KITLAB — Maillots de Football Premium', template: '%s | KITLAB' },
  description: 'Maillots de football premium pour tous les clubs. Livraison rapide en France et en Europe.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Update `globals.css` to use the font variables**

Replace the `@theme inline` block (fix: use unique names to avoid self-referential CSS variable loops):
```css
@theme inline {
  /* Use unique theme names — never reference a CSS var by the same name (infinite loop) */
  --font-sans: "Barlow", "Barlow Fallback", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Bebas Neue", "Bebas Neue Fallback", sans-serif;
  --font-condensed: "Barlow Condensed", "Barlow Condensed Fallback", sans-serif;
}
```

Then in `layout.tsx`, use `font-[family-name:var(--font-bebas)]` or add a Tailwind utility class via `tailwind.config`:
- Use `font-sans` for body text (Barlow)
- Use `font-[family-name:var(--font-bebas)]` for display headings, or add `font-display` to tailwind extend
- Use `font-[family-name:var(--font-barlow-condensed)]` for condensed labels (abbreviated as `font-condensed` in components)

- [ ] **Step 8: Configure `next.config.ts` for external images (must happen NOW — before any next/image usage)**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Add supplier image domains when scraper is integrated
    ],
  },
}

export default nextConfig
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```
Expected: `http://localhost:3000` loads with default Next.js page

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 with design system, fonts, and image domains"
```

---

## Phase 2: Database Schema (Supabase)

### Task 2.1: Create Supabase Tables

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/types/product.ts`
- Create: `src/types/order.ts`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/001_initial_schema.sql

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

-- Public read for products, leagues, clubs, patches
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Public can read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public can read patches" ON patches FOR SELECT USING (true);

-- Orders: only service role can write
CREATE POLICY "Service role manages orders" ON orders USING (auth.role() = 'service_role');
```

- [ ] **Step 2: Run migration in Supabase dashboard**

Go to Supabase Dashboard → SQL Editor → paste and run the migration.

- [ ] **Step 3: Create TypeScript types**

```typescript
// src/types/product.ts
export interface Product {
  id: string
  slug: string
  name: string
  club: string
  league: string
  country: string
  type: 'domicile' | 'exterieur' | 'third'
  season: string
  price: number
  description: string | null
  sizes: string[]
  available_patches: string[]
  photos: string[]
  stock: number
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export interface League {
  id: string
  slug: string
  name: string
  country: string
  flag_emoji: string
  display_order: number
}

export interface Club {
  id: string
  slug: string
  name: string
  league_id: string | null
  country: string
}

export interface Patch {
  id: string
  code: string
  name: string
  emoji: string
  countries: string[]
  competitions: string[]
}
```

```typescript
// src/types/order.ts
export interface OrderItem {
  product_id: string
  name: string
  size: string
  patch: string | null
  qty: number
  price: number
  photo: string
}

export interface ShippingAddress {
  street: string
  city: string
  postal_code: string
  country: string
}

export interface Order {
  id: string
  stripe_session_id: string | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: ShippingAddress | null
  items: OrderItem[]
  total_amount: number | null
  telegram_notified: boolean
  created_at: string
}
```

```typescript
// src/types/cart.ts
import { Patch } from './product'

export interface CartItem {
  product_id: string
  slug: string
  name: string
  club: string
  size: string
  patch: string | null
  patch_name: string | null
  price: number
  photo: string
  qty: number
}
```

- [ ] **Step 4: Create Supabase clients (lazy initialization)**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Service role client for webhooks (bypasses RLS) — use only in server-side Route Handlers
import { createClient } from '@supabase/supabase-js'

let _serviceClient: ReturnType<typeof createClient> | null = null

export function getSupabaseServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _serviceClient
}
```

- [ ] **Step 5: Create query functions**

```typescript
// src/lib/supabase/queries.ts
import { getSupabaseServerClient } from './server'
import type { Product, League, Club, Patch } from '@/types/product'

export async function getProducts(filters?: {
  league?: string
  club?: string
  type?: string
  featured?: boolean
  limit?: number
}): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()
  let query = supabase.from('products').select('*').eq('is_active', true)

  if (filters?.league) query = query.eq('league', filters.league)
  if (filters?.club) query = query.eq('club', filters.club)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.featured) query = query.eq('is_featured', true)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data
}

export async function getLeagues(): Promise<League[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('leagues')
    .select('*')
    .order('display_order')
  return data ?? []
}

export async function getPatches(): Promise<Patch[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('patches').select('*')
  return data ?? []
}

export async function getClubs(leagueSlug?: string): Promise<Club[]> {
  const supabase = await getSupabaseServerClient()
  // NOTE: Supabase JS v2 does NOT support filtering on joined table columns via dot-notation.
  // Instead, resolve the league_id first, then filter clubs by it.
  if (leagueSlug) {
    const { data: league } = await supabase
      .from('leagues')
      .select('id')
      .eq('slug', leagueSlug)
      .single()
    if (!league) return []
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .eq('league_id', league.id)
      .order('name')
    return data ?? []
  }
  const { data } = await supabase.from('clubs').select('*').order('name')
  return data ?? []
}
```

- [ ] **Step 6: Insert test data via Supabase SQL editor**

```sql
-- Test leagues
INSERT INTO leagues (slug, name, country, flag_emoji, display_order) VALUES
  ('ligue-1', 'Ligue 1', 'France', '🇫🇷', 1),
  ('premier-league', 'Premier League', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 2),
  ('la-liga', 'La Liga', 'Espagne', '🇪🇸', 3),
  ('bundesliga', 'Bundesliga', 'Allemagne', '🇩🇪', 4),
  ('serie-a', 'Serie A', 'Italie', '🇮🇹', 5);

-- Test patches
INSERT INTO patches (code, name, emoji, countries) VALUES
  ('ldc', 'Ligue des Champions', '⭐', ARRAY['France','Espagne','Angleterre','Allemagne','Italie']),
  ('coupe_france', 'Coupe de France', '🇫🇷', ARRAY['France']),
  ('fa_cup', 'FA Cup', '🎖️', ARRAY['Angleterre']),
  ('copa_del_rey', 'Copa del Rey', '🏆', ARRAY['Espagne']);

-- Test products
INSERT INTO products (slug, name, club, league, country, type, season, price, description, available_patches, photos, is_featured) VALUES
  ('psg-domicile-2425', 'PSG Domicile 2024/25', 'Paris Saint-Germain', 'Ligue 1', 'France', 'domicile', '2024-2025', 34.90, 'Le maillot domicile du PSG saison 2024/25', ARRAY['ldc','coupe_france'], ARRAY['https://placehold.co/400x500','https://placehold.co/400x500','https://placehold.co/400x500'], true),
  ('real-madrid-domicile-2425', 'Real Madrid Domicile 2024/25', 'Real Madrid', 'La Liga', 'Espagne', 'domicile', '2024-2025', 34.90, 'Le maillot domicile du Real Madrid', ARRAY['ldc','copa_del_rey'], ARRAY['https://placehold.co/400x500','https://placehold.co/400x500','https://placehold.co/400x500'], true),
  ('arsenal-exterieur-2425', 'Arsenal Extérieur 2024/25', 'Arsenal', 'Premier League', 'Angleterre', 'exterieur', '2024-2025', 34.90, 'Le maillot extérieur d''Arsenal', ARRAY['ldc','fa_cup'], ARRAY['https://placehold.co/400x500','https://placehold.co/400x500','https://placehold.co/400x500'], true);
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: database schema, Supabase clients, TypeScript types"
```

---

## Phase 3: Zustand Cart Store

### Task 3.1: Cart State

**Files:**
- Create: `src/store/cart.ts`
- Create: `src/components/providers/Providers.tsx`

- [ ] **Step 1: Write the cart store**

```typescript
// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (product_id: string, size: string) => void
  updateQty: (product_id: string, size: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find(
          (i) => i.product_id === newItem.product_id && i.size === newItem.size
        )
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.product_id === newItem.product_id && i.size === newItem.size
                ? { ...i, qty: i.qty + newItem.qty }
                : i
            ),
            isOpen: true,
          }
        }
        return { items: [...state.items, newItem], isOpen: true }
      }),

      removeItem: (product_id, size) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.product_id === product_id && i.size === size)
        ),
      })),

      updateQty: (product_id, size, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter((i) => !(i.product_id === product_id && i.size === size))
          : state.items.map((i) =>
              i.product_id === product_id && i.size === size ? { ...i, qty } : i
            ),
      })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'kitlab-cart', skipHydration: true }
  )
)
```

- [ ] **Step 2: Create Providers wrapper**

```tsx
// src/components/providers/Providers.tsx
'use client'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydrate Zustand after mount to avoid SSR mismatch
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 3: Add Providers to layout**

Update `src/app/layout.tsx` body:
```tsx
import { Providers } from '@/components/providers/Providers'
// ...
<body className="antialiased font-sans">
  <Providers>
    {children}
  </Providers>
</body>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Zustand cart store with persist middleware"
```

---

## Phase 4: Global Layout — Navbar, Footer, Ticker

### Task 4.1: UI Primitives

**Files:**
- Create: `src/lib/utils.ts`  ← MUST be created first (imported by Button, Badge, SectionTitle)
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/SectionTitle.tsx`
- Create: `src/components/ui/ScrollReveal.tsx`

- [ ] **Step 1: Install cn dependencies and create `src/lib/utils.ts`**

```bash
npm install clsx tailwind-merge
```

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create Button component**

```tsx
// src/components/ui/Button.tsx
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-condensed tracking-widest uppercase transition-all',
        {
          'bg-[var(--terra)] text-white hover:bg-[var(--terra-2)] active:scale-95': variant === 'primary',
          'border-2 border-[var(--terra)] text-[var(--terra)] hover:bg-[var(--terra-lt)]': variant === 'secondary',
          'text-[var(--grey)] hover:text-[var(--black)]': variant === 'ghost',
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Create ScrollReveal**

```tsx
// src/components/ui/ScrollReveal.tsx
'use client'
import { useEffect, useRef } from 'react'

export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={`reveal ${className ?? ''}`}>{children}</div>
}
```

- [ ] **Step 4: Create SectionTitle**

```tsx
// src/components/ui/SectionTitle.tsx
import { cn } from '@/lib/utils'

export function SectionTitle({ children, sub, center, className }: {
  children: React.ReactNode
  sub?: string
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-8', center && 'text-center', className)}>
      {sub && (
        <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-2">{sub}</p>
      )}
      <h2 className="font-bebas text-5xl md:text-6xl leading-none text-[var(--black)]">{children}</h2>
    </div>
  )
}
```

- [ ] **Step 5: Create Badge**

```tsx
// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils'

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-block font-condensed text-xs tracking-widest uppercase px-2 py-0.5',
      'bg-[var(--terra-lt)] text-[var(--terra)] border border-[var(--terra-mid)]',
      className
    )}>
      {children}
    </span>
  )
}
```

### Task 4.2: Ticker Component

**Files:**
- Create: `src/components/layout/Ticker.tsx`

- [ ] **Step 1: Create Ticker**

```tsx
// src/components/layout/Ticker.tsx
const TICKER_ITEMS = [
  'LIVRAISON OFFERTE DÈS 60€',
  'REAL MADRID', 'PSG', 'MANCHESTER CITY', 'BARCELONA',
  'JUVENTUS', 'BAYERN MUNICH', 'ARSENAL', 'LIVERPOOL',
  'PAIEMENT SÉCURISÉ', 'MAILLOTS PREMIUM',
]

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // duplicate for seamless loop
  return (
    <div
      className="overflow-hidden py-3 bg-[var(--terra)]"
      role="marquee"
      aria-label="Informations du site"
    >
      <div className="ticker-track flex gap-12 whitespace-nowrap w-max">
        {items.map((item, i) => (
          <span key={i} className="font-condensed text-sm tracking-[3px] uppercase text-white flex items-center gap-4">
            {item}
            <span className="w-1 h-1 rounded-full bg-white/50 inline-block" />
          </span>
        ))}
      </div>
    </div>
  )
}
```

### Task 4.3: Navbar

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/cart/CartButton.tsx`

- [ ] **Step 1: Create CartButton**

```tsx
// src/components/cart/CartButton.tsx
'use client'
import { useCartStore } from '@/store/cart'

export function CartButton() {
  const { itemCount, openCart } = useCartStore()
  const count = itemCount()

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-[var(--black)] hover:text-[var(--terra)] transition-colors"
      aria-label={`Panier — ${count} article(s)`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--terra)] text-white text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Create Navbar**

```tsx
// src/components/layout/Navbar.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CartButton } from '@/components/cart/CartButton'

const LEAGUES = [
  { name: 'Ligue 1', slug: 'ligue-1', flag: '🇫🇷' },
  { name: 'Premier League', slug: 'premier-league', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga', slug: 'la-liga', flag: '🇪🇸' },
  { name: 'Bundesliga', slug: 'bundesliga', flag: '🇩🇪' },
  { name: 'Serie A', slug: 'serie-a', flag: '🇮🇹' },
  { name: 'Sélections', slug: 'selections', flag: '🌍' },
]

export function Navbar() {
  const [leaguesOpen, setLeaguesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--cream-3)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bebas text-3xl tracking-widest text-[var(--black)] hover:text-[var(--terra)] transition-colors">
          KITLAB
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="font-condensed text-sm tracking-widest uppercase text-[var(--black)] hover:text-[var(--terra)] transition-colors">
            Tous les Maillots
          </Link>
          <div className="relative" onMouseEnter={() => setLeaguesOpen(true)} onMouseLeave={() => setLeaguesOpen(false)}>
            <button className="font-condensed text-sm tracking-widest uppercase text-[var(--black)] hover:text-[var(--terra)] transition-colors flex items-center gap-1">
              Championnats
              <svg className={`w-3 h-3 transition-transform ${leaguesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {leaguesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[var(--cream-3)] shadow-lg py-2">
                {LEAGUES.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/ligue/${l.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 font-condensed text-sm tracking-wide uppercase hover:bg-[var(--cream)] hover:text-[var(--terra)] transition-colors"
                  >
                    <span>{l.flag}</span>
                    {l.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <CartButton />
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--cream-3)] px-4 py-4 space-y-4">
          <Link href="/shop" onClick={() => setMobileOpen(false)} className="block font-condensed tracking-widest uppercase text-sm">Tous les Maillots</Link>
          {LEAGUES.map((l) => (
            <Link key={l.slug} href={`/ligue/${l.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-condensed tracking-wide uppercase text-sm text-[var(--grey)]">
              <span>{l.flag}</span>{l.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
```

### Task 4.4: Footer & Cart Drawer

**Files:**
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/cart/CartDrawer.tsx`
- Create: `src/components/cart/CartItem.tsx`

- [ ] **Step 1: Create Footer**

```tsx
// src/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[var(--black-2)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-bebas text-3xl tracking-widest mb-4">KITLAB</p>
          <p className="text-[var(--grey-lt)] text-sm leading-relaxed">
            Maillots de football premium pour tous les clubs et toutes les ligues.
          </p>
        </div>
        <div>
          <h3 className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey-lt)] mb-4">Boutique</h3>
          <ul className="space-y-2">
            {[['Tous les maillots', '/shop'], ['Ligue 1', '/ligue/ligue-1'], ['Premier League', '/ligue/premier-league'], ['La Liga', '/ligue/la-liga']].map(([label, href]) => (
              <li key={href}><Link href={href} className="text-sm text-[var(--grey-lt)] hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey-lt)] mb-4">Aide</h3>
          <ul className="space-y-2">
            {[['FAQ', '/faq'], ['Suivi de commande', '/suivi'], ['Nous contacter', '/contact']].map(([label, href]) => (
              <li key={href}><Link href={href} className="text-sm text-[var(--grey-lt)] hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey-lt)] mb-4">Légal</h3>
          <ul className="space-y-2">
            {[['CGV', '/legal/cgv'], ['Mentions légales', '/legal/mentions-legales'], ['Confidentialité', '/legal/confidentialite'], ['Livraison', '/legal/livraison']].map(([label, href]) => (
              <li key={href}><Link href={href} className="text-sm text-[var(--grey-lt)] hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-xs text-[var(--grey-lt)]">© {new Date().getFullYear()} KITLAB — Tous droits réservés</p>
        <div className="flex items-center gap-3">
          {['Visa', 'Mastercard', 'CB', 'PayPal'].map((p) => (
            <span key={p} className="text-xs font-condensed tracking-wider text-[var(--grey-lt)] border border-white/20 px-2 py-0.5">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Create CartItem**

```tsx
// src/components/cart/CartItem.tsx
'use client'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import type { CartItem as CartItemType } from '@/types/cart'

export function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, updateQty } = useCartStore()

  return (
    <div className="flex gap-4 py-4 border-b border-[var(--cream-3)]">
      <div className="relative w-20 h-24 bg-[var(--cream)] flex-shrink-0">
        <Image src={item.photo} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-condensed text-sm tracking-wide uppercase text-[var(--black)] truncate">{item.name}</p>
        <p className="text-xs text-[var(--grey)] mt-0.5">
          Taille: {item.size}
          {item.patch_name && ` · ${item.patch_name}`}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-[var(--cream-3)]">
            <button onClick={() => updateQty(item.product_id, item.size, item.qty - 1)} className="px-2 py-1 hover:bg-[var(--cream)]">-</button>
            <span className="px-3 py-1 text-sm">{item.qty}</span>
            <button onClick={() => updateQty(item.product_id, item.size, item.qty + 1)} className="px-2 py-1 hover:bg-[var(--cream)]">+</button>
          </div>
          <p className="font-condensed font-semibold">{(item.price * item.qty).toFixed(2)} €</p>
        </div>
      </div>
      <button onClick={() => removeItem(item.product_id, item.size)} className="text-[var(--grey)] hover:text-[var(--terra)] transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create CartDrawer**

```tsx
// src/components/cart/CartDrawer.tsx
'use client'
import { useCartStore } from '@/store/cart'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { items, isOpen, closeCart, total } = useCartStore()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--cream-3)]">
          <h2 className="font-bebas text-2xl tracking-widest">Mon Panier</h2>
          <button onClick={closeCart} className="text-[var(--grey)] hover:text-[var(--black)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="font-bebas text-3xl text-[var(--cream-3)]">Panier vide</p>
              <p className="text-[var(--grey)] text-sm mt-2">Ajoutez des maillots pour commencer</p>
            </div>
          ) : (
            items.map((item) => <CartItem key={`${item.product_id}-${item.size}`} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[var(--cream-3)] space-y-4">
            <div className="flex justify-between font-condensed text-lg tracking-wide">
              <span>Total</span>
              <span className="font-bold">{total().toFixed(2)} €</span>
            </div>
            <p className="text-xs text-[var(--grey)] text-center">Livraison offerte dès 60€</p>
            <CheckoutButton />
          </div>
        )}
      </div>
    </>
  )
}

function CheckoutButton() {
  const { items, total } = useCartStore()

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items, total: total() }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <Button onClick={handleCheckout} size="lg" className="w-full">
      Commander — {total().toFixed(2)} €
    </Button>
  )
}
```

- [ ] **Step 4: Add Navbar, CartDrawer to root layout**

Update `src/app/layout.tsx`:
```tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Ticker } from '@/components/layout/Ticker'
import { CartDrawer } from '@/components/cart/CartDrawer'

// Inside <body>:
<Providers>
  <Navbar />
  <CartDrawer />
  <main>{children}</main>
  <Footer />
</Providers>
```

- [ ] **Step 5: Test layout renders correctly**

```bash
npm run dev
```
Expected: Navbar + empty cart drawer (opens on click) + footer

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: navbar, footer, ticker, cart drawer with Zustand"
```

---

## Phase 5: Homepage

### Task 5.1: Hero Section

**Files:**
- Create: `src/components/home/HeroSection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create HeroSection**

```tsx
// src/components/home/HeroSection.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types/product'

export function HeroSection({ featured }: { featured: Product[] }) {
  return (
    <section className="min-h-[85vh] flex items-center bg-[var(--cream)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid md:grid-cols-[55fr_45fr] gap-8 md:gap-12 py-12">
        {/* Left: Text */}
        <div className="flex flex-col justify-center">
          <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-4">
            Maillots Premium · Saison 2024/25
          </p>
          <h1 className="font-bebas text-7xl md:text-9xl leading-none text-[var(--black)] mb-6">
            TOUS LES<br />
            <span className="text-[var(--terra)]">GRANDS</span><br />
            CLUBS
          </h1>
          <p className="text-[var(--grey)] text-lg leading-relaxed max-w-md mb-8 font-light">
            390+ maillots officiels pour tous les clubs et championnats. Tailles S à XXL, patchs disponibles, livraison rapide.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop">
              <Button size="lg">Explorer la boutique</Button>
            </Link>
            <Link href="/ligue/premier-league">
              <Button variant="secondary" size="lg">Premier League</Button>
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[var(--cream-3)]">
            {[['390+', 'Maillots'], ['48h', 'Livraison'], ['100%', 'Sécurisé']].map(([n, l]) => (
              <div key={l}>
                <p className="font-bebas text-3xl text-[var(--terra)]">{n}</p>
                <p className="font-condensed text-xs tracking-widest uppercase text-[var(--grey)]">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Featured product cards */}
        <div className="hidden md:grid grid-cols-2 gap-4 items-start">
          {featured.slice(0, 4).map((p, i) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className={`group block bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-[var(--terra)] border border-[var(--cream-3)] ${i === 1 ? 'mt-8' : ''}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={p.photos[0]}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="font-condensed text-xs tracking-widest uppercase text-[var(--grey)]">{p.club}</p>
                <p className="font-condensed text-sm font-semibold truncate">{p.type}</p>
                <p className="text-[var(--terra)] font-semibold text-sm mt-1">{p.price.toFixed(2)} €</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Task 5.2: Leagues Strip, Why Us, Reassurance

**Files:**
- Create: `src/components/home/LeaguesStrip.tsx`
- Create: `src/components/home/WhyUsSection.tsx`
- Create: `src/components/home/ReassuranceBar.tsx`
- Create: `src/components/home/ReviewsSection.tsx`
- Create: `src/components/home/PatchesBanner.tsx`

- [ ] **Step 1: Create LeaguesStrip**

```tsx
// src/components/home/LeaguesStrip.tsx
import Link from 'next/link'
import type { League } from '@/types/product'

export function LeaguesStrip({ leagues }: { leagues: League[] }) {
  return (
    <section className="bg-[var(--cream-2)] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="font-condensed text-xs tracking-[4px] uppercase text-[var(--grey)] mb-6 text-center">Championnats disponibles</p>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/ligue/${league.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md group-hover:border-[var(--terra)] border-2 border-transparent transition-all">
                {league.flag_emoji}
              </div>
              <span className="font-condensed text-xs tracking-wider uppercase text-[var(--grey)] group-hover:text-[var(--terra)] transition-colors whitespace-nowrap">
                {league.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create WhyUsSection**

```tsx
// src/components/home/WhyUsSection.tsx
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const WHY_ITEMS = [
  { icon: '⚡', title: 'Fournisseur direct', desc: 'Nous travaillons directement avec les fabricants pour vous garantir les meilleurs prix sans intermédiaire.' },
  { icon: '🏆', title: 'Patchs officiels', desc: 'Ajoutez les patchs LDC, Copa, FA Cup et bien d\'autres à votre maillot selon l\'éligibilité du club.' },
  { icon: '🚚', title: 'Livraison rapide', desc: 'Expédition sous 24-48h. Livraison offerte dès 60€ d\'achats en France métropolitaine.' },
]

export function WhyUsSection() {
  return (
    <section className="py-20 bg-[var(--black-2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-3">Pourquoi nous choisir</p>
          <h2 className="font-bebas text-5xl md:text-6xl text-white">LA DIFFÉRENCE KITLAB</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {WHY_ITEMS.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="bg-[var(--black-3)] p-8 border border-white/10 hover:border-[var(--terra)] transition-colors group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bebas text-2xl text-white mb-3 group-hover:text-[var(--terra)] transition-colors">{item.title}</h3>
                <p className="text-[var(--grey-lt)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create ReassuranceBar**

```tsx
// src/components/home/ReassuranceBar.tsx
const ITEMS = [
  { icon: '🔒', label: 'Paiement sécurisé', sub: 'Stripe certifié PCI' },
  { icon: '📦', label: 'Expédition 24/48h', sub: 'Suivi inclus' },
  { icon: '💬', label: 'SAV réactif', sub: 'Réponse sous 24h' },
  { icon: '🚚', label: 'Livraison offerte', sub: 'Dès 60€ d\'achats' },
]

export function ReassuranceBar() {
  return (
    <div className="bg-white border-y border-[var(--cream-3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--cream-3)]">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3 py-4 px-4 md:px-6">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-condensed text-sm tracking-wide font-semibold uppercase text-[var(--black)]">{item.label}</p>
              <p className="text-xs text-[var(--grey)]">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ReviewsSection**

```tsx
// src/components/home/ReviewsSection.tsx
const REVIEWS = [
  { name: 'Thomas M.', rating: 5, text: 'Qualité exceptionnelle, les coutures sont parfaites. Mon maillot du Real Madrid avec le patch LDC est magnifique !', date: 'Il y a 2 semaines' },
  { name: 'Sarah K.', rating: 5, text: 'Livraison ultra rapide, maillot conforme à la description. Je recommande vivement KITLAB !', date: 'Il y a 1 mois' },
  { name: 'Pierre D.', rating: 5, text: 'Acheté 3 maillots pour mes enfants, ils sont ravis. Bonne taille, belle finition. Site à recommander.', date: 'Il y a 3 semaines' },
]

export function ReviewsSection() {
  return (
    <section className="py-20 bg-[var(--terra)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-bebas text-5xl md:text-6xl text-white">CE QUE DISENT NOS CLIENTS</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white/10 backdrop-blur p-6 border border-white/20">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-300 text-sm">★</span>
                ))}
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-4">"{r.text}"</p>
              <div className="flex items-center justify-between">
                <p className="font-condensed text-sm tracking-wide font-semibold text-white uppercase">{r.name}</p>
                <p className="text-white/50 text-xs">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Task 5.3: ProductCard & ProductsGrid

**Files:**
- Create: `src/components/products/ProductCard.tsx`
- Create: `src/components/products/ProductsGrid.tsx`

- [ ] **Step 1: Create ProductCard**

```tsx
// src/components/products/ProductCard.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const photo = hovered && product.photos[1] ? product.photos[1] : product.photos[0]

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div
        className="bg-white border border-[var(--cream-3)] hover:border-[var(--terra)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(193,68,14,0.12)] transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--cream)]">
          {photo && (
            <Image
              src={photo}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          {product.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge>Bestseller</Badge>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-[var(--terra)] text-white text-center py-2 font-condensed text-xs tracking-widest uppercase">
              Voir le maillot →
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="font-condensed text-xs tracking-widest uppercase text-[var(--grey)] mb-1">{product.club}</p>
          <p className="font-condensed text-sm font-semibold text-[var(--black)] capitalize">{product.type} {product.season}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="font-condensed text-lg font-bold text-[var(--terra)]">{product.price.toFixed(2)} €</p>
            {product.available_patches.length > 0 && (
              <span className="text-xs text-[var(--grey)]">+{product.available_patches.length} patchs</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create ProductsGrid**

```tsx
// src/components/products/ProductsGrid.tsx
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'

export function ProductsGrid({ products, title, sub }: {
  products: Product[]
  title?: string
  sub?: string
}) {
  return (
    <div>
      {title && (
        <div className="text-center mb-10">
          {sub && <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-2">{sub}</p>}
          <h2 className="font-bebas text-5xl md:text-6xl text-[var(--black)]">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
```

### Task 5.4: Assemble Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the homepage**

```tsx
// src/app/page.tsx
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/home/HeroSection'
import { Ticker } from '@/components/layout/Ticker'
import { LeaguesStrip } from '@/components/home/LeaguesStrip'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import { ReassuranceBar } from '@/components/home/ReassuranceBar'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export default async function HomePage() {
  const [featured, leagues] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getLeagues(),
  ])

  return (
    <>
      <HeroSection featured={featured} />
      <Ticker />
      <LeaguesStrip leagues={leagues} />
      <ReassuranceBar />

      <section className="py-20 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <ProductsGrid
              products={featured.slice(0, 8)}
              title="BESTSELLERS"
              sub="Les plus populaires"
            />
          </ScrollReveal>
        </div>
      </section>

      <WhyUsSection />
      <ReviewsSection />
    </>
  )
}
```

- [ ] **Step 2: Test the homepage**

```bash
npm run dev
```
Navigate to `http://localhost:3000` — verify all sections render, cards show, fonts load.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: homepage with hero, leagues strip, products grid, why us, reviews"
```

---

## Phase 6: Catalogue (/shop) & Fiche Produit

### Task 6.1: Shop Page with Filters

**Files:**
- Create: `src/app/shop/page.tsx`
- Create: `src/components/products/FilterSidebar.tsx`
- Create: `src/components/products/SortBar.tsx`

- [ ] **Step 1: Create FilterSidebar**

```tsx
// src/components/products/FilterSidebar.tsx
'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { League } from '@/types/product'

export function FilterSidebar({ leagues }: { leagues: League[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const active = (key: string, value: string) => searchParams.get(key) === value

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white border border-[var(--cream-3)] p-6 sticky top-20">
        <h3 className="font-bebas text-2xl tracking-widest mb-6">Filtres</h3>

        {/* League filter */}
        <div className="mb-6">
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">Championnat</p>
          <div className="space-y-2">
            {leagues.map((l) => (
              <label key={l.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active('league', l.slug)}
                  onChange={() => updateFilter('league', l.slug)}
                  className="accent-[var(--terra)]"
                />
                <span className="text-sm group-hover:text-[var(--terra)] transition-colors">
                  {l.flag_emoji} {l.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="mb-6">
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">Type</p>
          <div className="space-y-2">
            {[['domicile', 'Domicile'], ['exterieur', 'Extérieur'], ['third', 'Third']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active('type', v)}
                  onChange={() => updateFilter('type', v)}
                  className="accent-[var(--terra)]"
                />
                <span className="text-sm group-hover:text-[var(--terra)] transition-colors">{l}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create Shop page**

```tsx
// src/app/shop/page.tsx
import { Suspense } from 'react'
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { FilterSidebar } from '@/components/products/FilterSidebar'

export const metadata = { title: 'Tous les Maillots' }

interface ShopPageProps {
  searchParams: Promise<{ league?: string; type?: string; sort?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const [products, leagues] = await Promise.all([
    getProducts({ league: params.league, type: params.type }),
    getLeagues(),
  ])

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)] mb-2">Notre catalogue</p>
        <h1 className="font-bebas text-6xl md:text-7xl text-white">TOUS LES MAILLOTS</h1>
        <p className="text-[var(--grey-lt)] mt-2">{products.length} maillots disponibles</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <Suspense fallback={null}>
            <FilterSidebar leagues={leagues} />
          </Suspense>
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-bebas text-4xl text-[var(--cream-3)]">Aucun maillot trouvé</p>
              </div>
            ) : (
              <ProductsGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Task 6.2: Fiche Produit

**Files:**
- Create: `src/app/shop/[slug]/page.tsx`
- Create: `src/components/products/PhotoGallery.tsx`
- Create: `src/components/products/SizeSelector.tsx`
- Create: `src/components/products/PatchSelector.tsx`
- Create: `src/components/products/AddToCartForm.tsx`

- [ ] **Step 1: Create PhotoGallery**

```tsx
// src/components/products/PhotoGallery.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

export function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] bg-[var(--cream)]">
        <Image src={photos[active]} alt={name} fill className="object-cover" priority />
      </div>
      <div className="flex gap-3">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative w-20 h-24 border-2 transition-colors ${active === i ? 'border-[var(--terra)]' : 'border-[var(--cream-3)]'}`}
          >
            <Image src={p} alt={`${name} ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create SizeSelector**

```tsx
// src/components/products/SizeSelector.tsx
'use client'
const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function SizeSelector({ available, selected, onSelect }: {
  available: string[]
  selected: string | null
  onSelect: (size: string) => void
}) {
  return (
    <div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">
        Taille {selected && <span className="text-[var(--terra)] ml-2">{selected}</span>}
      </p>
      <div className="flex gap-2 flex-wrap">
        {SIZES.map((size) => {
          const avail = available.includes(size)
          return (
            <button
              key={size}
              onClick={() => avail && onSelect(size)}
              disabled={!avail}
              className={`w-12 h-12 border font-condensed text-sm font-semibold transition-all
                ${selected === size
                  ? 'bg-[var(--terra)] text-white border-[var(--terra)]'
                  : avail
                    ? 'border-[var(--cream-3)] hover:border-[var(--terra)] hover:text-[var(--terra)]'
                    : 'border-[var(--cream-3)] text-[var(--cream-3)] cursor-not-allowed line-through'
                }`}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create PatchSelector**

```tsx
// src/components/products/PatchSelector.tsx
'use client'
import type { Patch } from '@/types/product'

export function PatchSelector({ patches, selected, onSelect }: {
  patches: Patch[]
  selected: string | null
  onSelect: (code: string | null) => void
}) {
  if (patches.length === 0) return null

  return (
    <div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">
        Patch optionnel
      </p>
      <div className="space-y-2">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-4 py-3 border font-condensed text-sm tracking-wide transition-all
            ${selected === null
              ? 'border-[var(--terra)] bg-[var(--terra-lt)] text-[var(--terra)]'
              : 'border-[var(--cream-3)] hover:border-[var(--terra)]'
            }`}
        >
          Sans patch
        </button>
        {patches.map((p) => (
          <button
            key={p.code}
            onClick={() => onSelect(p.code)}
            className={`w-full text-left px-4 py-3 border font-condensed text-sm tracking-wide transition-all
              ${selected === p.code
                ? 'border-[var(--terra)] bg-[var(--terra-lt)] text-[var(--terra)]'
                : 'border-[var(--cream-3)] hover:border-[var(--terra)]'
              }`}
          >
            <span className="mr-2">{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create AddToCartForm (client component)**

```tsx
// src/components/products/AddToCartForm.tsx
'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { SizeSelector } from './SizeSelector'
import { PatchSelector } from './PatchSelector'
import { Button } from '@/components/ui/Button'
import type { Product, Patch } from '@/types/product'

export function AddToCartForm({ product, patches }: { product: Product; patches: Patch[] }) {
  const [size, setSize] = useState<string | null>(null)
  const [patch, setPatch] = useState<string | null>(null)
  const [error, setError] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  const availablePatches = patches.filter((p) => product.available_patches.includes(p.code))

  const handleAdd = () => {
    if (!size) { setError('Veuillez sélectionner une taille'); return }
    setError('')
    const selectedPatch = patches.find((p) => p.code === patch)
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      size,
      patch,
      patch_name: selectedPatch?.name ?? null,
      price: product.price,
      photo: product.photos[0],
      qty: 1,
    })
  }

  return (
    <div className="space-y-6">
      <SizeSelector available={product.sizes} selected={size} onSelect={setSize} />
      <PatchSelector patches={availablePatches} selected={patch} onSelect={setPatch} />
      {error && <p className="text-[var(--terra)] text-sm font-condensed">{error}</p>}
      <Button onClick={handleAdd} size="lg" className="w-full">
        Ajouter au panier — {product.price.toFixed(2)} €
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Create product detail page**

```tsx
// src/app/shop/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getPatches } from '@/lib/supabase/queries'
import { PhotoGallery } from '@/components/products/PhotoGallery'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { Badge } from '@/components/ui/Badge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: `Achetez le ${product.name} - ${product.type} saison ${product.season}. Prix: ${product.price}€`,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, patches] = await Promise.all([
    getProductBySlug(slug),
    getPatches(),
  ])
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <PhotoGallery photos={product.photos} name={product.name} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge>{product.league}</Badge>
              <Badge className="capitalize">{product.type}</Badge>
            </div>
            <h1 className="font-bebas text-4xl md:text-5xl text-[var(--black)] leading-tight mb-2">
              {product.name}
            </h1>
            <p className="text-[var(--grey)] font-condensed text-sm tracking-widest uppercase mb-4">{product.club} · {product.season}</p>
            <p className="font-bebas text-4xl text-[var(--terra)] mb-6">{product.price.toFixed(2)} €</p>

            {product.description && (
              <p className="text-[var(--grey)] text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            <AddToCartForm product={product} patches={patches} />

            <div className="mt-8 pt-6 border-t border-[var(--cream-3)] space-y-2">
              {[
                ['🚚', 'Livraison offerte dès 60€ · Expédition sous 24-48h'],
                ['🔒', 'Paiement 100% sécurisé via Stripe'],
                ['↩️', 'Retours acceptés sous 14 jours'],
              ].map(([icon, text]) => (
                <p key={text} className="text-sm text-[var(--grey)] flex gap-2"><span>{icon}</span>{text}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: shop catalogue, filters, product detail page with cart integration"
```

---

## Phase 7: Stripe Checkout & Webhook

### Task 7.1: Stripe Integration

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/lib/telegram.ts`
- Create: `src/lib/formatOrder.ts`
- Create: `src/app/order-confirmed/page.tsx`

- [ ] **Step 1: Create Stripe client**

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    })
  }
  return _stripe
}
```

- [ ] **Step 2: Create checkout session route**

```typescript
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import type { CartItem } from '@/types/cart'

export async function POST(request: NextRequest) {
  const { items }: { items: CartItem[] } = await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    locale: 'fr',
    line_items: items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.name} - Taille ${item.size}${item.patch_name ? ` + Patch ${item.patch_name}` : ''}`,
          images: item.photo ? [item.photo] : [],
          metadata: {
            product_id: item.product_id,
            size: item.size,
            patch: item.patch ?? '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    shipping_address_collection: {
      allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'GB', 'NL', 'PT'],
    },
    phone_number_collection: { enabled: true },
    success_url: `${baseUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shop`,
    metadata: {
      items: JSON.stringify(items),
    },
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **Step 3: Create Telegram notification functions**

```typescript
// src/lib/formatOrder.ts
import type { Order } from '@/types/order'

export function formatOrderMessage(order: Order): string {
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const itemLines = order.items.map((item) =>
    `• <b>${item.name}</b>\n  Taille : ${item.size}${item.patch ? ` | Patch : ${item.patch}` : ''}\n  Prix : ${item.price.toFixed(2)} €${item.qty > 1 ? ` × ${item.qty}` : ''}`
  ).join('\n\n')

  const addr = order.shipping_address
  const addrStr = addr
    ? `${addr.street}\n${addr.postal_code} ${addr.city}, ${addr.country}`
    : 'Non renseignée'

  return `🛒 <b>NOUVELLE COMMANDE — #${order.id.slice(-8).toUpperCase()}</b>

👤 <b>CLIENT</b>
Nom : ${order.customer_name ?? 'N/A'}
Email : ${order.customer_email ?? 'N/A'}
Téléphone : ${order.customer_phone ?? 'N/A'}

📦 <b>COMMANDE</b>
${itemLines}

💰 <b>TOTAL : ${order.total_amount?.toFixed(2)} €</b>

📍 <b>LIVRAISON</b>
${addrStr}

🕐 Commandé le ${date}`
}
```

```typescript
// src/lib/telegram.ts
import type { Order } from '@/types/order'
import { formatOrderMessage } from './formatOrder'

export async function sendTelegramNotification(order: Order): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram env vars missing')
    return false
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatOrderMessage(order),
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch (err) {
    console.error('Telegram notification failed:', err)
    return false
  }
}
```

- [ ] **Step 4: Create Stripe webhook handler**

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/telegram'
import type { CartItem } from '@/types/cart'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const items: CartItem[] = JSON.parse(session.metadata?.items ?? '[]')
    const address = session.shipping_details?.address

    const order = {
      stripe_session_id: session.id,
      status: 'paid' as const,
      customer_name: session.customer_details?.name,
      customer_email: session.customer_details?.email,
      customer_phone: session.customer_details?.phone,
      shipping_address: address ? {
        street: address.line1,
        city: address.city,
        postal_code: address.postal_code,
        country: address.country,
      } : null,
      items: items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        size: i.size,
        patch: i.patch,
        qty: i.qty,
        price: i.price,
        photo: i.photo,
      })),
      total_amount: session.amount_total ? session.amount_total / 100 : null,
    }

    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error) {
      console.error('Failed to insert order:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Send Telegram notification
    const notified = await sendTelegramNotification(data)
    if (notified) {
      await supabase.from('orders').update({ telegram_notified: true }).eq('id', data.id)
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 5: Create order confirmation page**

```tsx
// src/app/order-confirmed/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Commande confirmée' }

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 text-center py-20">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="font-bebas text-5xl md:text-6xl text-[var(--black)] mb-4">
          COMMANDE CONFIRMÉE
        </h1>
        <p className="text-[var(--grey)] leading-relaxed mb-2">
          Merci pour votre commande ! Vous allez recevoir un email de confirmation.
        </p>
        <p className="text-[var(--grey)] text-sm mb-8">
          Expédition sous 24-48h · Suivi par email
        </p>
        <Link href="/shop">
          <Button size="lg">Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Test the checkout flow locally**

```bash
# Install Stripe CLI for webhook testing
# Then in one terminal:
npm run dev

# In another terminal:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Add a test product to cart → click "Commander" → use Stripe test card `4242 4242 4242 4242` → verify order appears in Supabase and Telegram message sent.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Stripe checkout, webhook handler, Telegram notifications"
```

---

## Phase 8: League & Club Pages

### Task 8.1: Dynamic League/Club Pages

**Files:**
- Create: `src/app/ligue/[slug]/page.tsx`
- Create: `src/app/club/[slug]/page.tsx`

- [ ] **Step 1: Create league page**

```tsx
// src/app/ligue/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { ProductsGrid } from '@/components/products/ProductsGrid'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = leagues.find((l) => l.slug === slug)
  if (!league) return {}
  return { title: `Maillots ${league.name}` }
}

export default async function LeaguePage({ params }: Props) {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = leagues.find((l) => l.slug === slug)
  if (!league) notFound()

  const products = await getProducts({ league: slug })

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="text-4xl mb-3">{league.flag_emoji}</p>
        <h1 className="font-bebas text-6xl md:text-7xl text-white">{league.name}</h1>
        <p className="text-[var(--grey-lt)] mt-2">{products.length} maillots disponibles</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {products.length > 0
          ? <ProductsGrid products={products} />
          : <p className="text-center text-[var(--grey)] py-20">Aucun maillot disponible pour ce championnat.</p>
        }
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: league and club dynamic pages"
```

---

## Phase 9: Supporting Pages

### Task 9.1: FAQ, Order Tracking, Legal Pages

**Files:**
- Create: `src/app/faq/page.tsx`
- Create: `src/app/suivi/page.tsx`
- Create: `src/app/legal/cgv/page.tsx`
- Create: `src/app/legal/mentions-legales/page.tsx`

- [ ] **Step 1: Create FAQ page**

```tsx
// src/app/faq/page.tsx
const FAQ_ITEMS = [
  { q: 'Quels sont les délais de livraison ?', a: 'Nous expédions sous 24-48h. Comptez 3-7 jours ouvrés pour la livraison en France, 5-10 jours pour l\'Europe.' },
  { q: 'Quelle taille choisir ?', a: 'Les maillots taillent généralement grand. Si vous êtes entre deux tailles, choisissez la plus petite. Consultez notre guide des tailles pour plus de détails.' },
  { q: 'Comment fonctionne le système de patchs ?', a: 'Les patchs (LDC, Coupe de France, FA Cup...) sont disponibles selon l\'éligibilité du club. Vous pouvez les ajouter lors de l\'achat.' },
  { q: 'Puis-je retourner mon maillot ?', a: 'Oui, les retours sont acceptés sous 14 jours suivant la réception, en état neuf avec les étiquettes.' },
  { q: 'Comment suivre ma commande ?', a: 'Vous recevrez un email avec le numéro de suivi dès l\'expédition de votre commande.' },
]

export const metadata = { title: 'FAQ' }

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-bebas text-6xl text-[var(--black)] mb-12">QUESTIONS FRÉQUENTES</h1>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="border border-[var(--cream-3)] bg-white p-6">
              <h2 className="font-condensed text-base font-semibold tracking-wide text-[var(--black)] mb-3">{item.q}</h2>
              <p className="text-[var(--grey)] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create order tracking page (basic)**

```tsx
// src/app/suivi/page.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function SuiviPage() {
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('')

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-16">
        <h1 className="font-bebas text-5xl text-[var(--black)] mb-2">SUIVI DE COMMANDE</h1>
        <p className="text-[var(--grey)] text-sm mb-8">Entrez votre email et numéro de commande</p>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full border border-[var(--cream-3)] px-4 py-3 bg-white font-condensed text-sm focus:border-[var(--terra)] outline-none"
          />
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Numéro de commande"
            className="w-full border border-[var(--cream-3)] px-4 py-3 bg-white font-condensed text-sm focus:border-[var(--terra)] outline-none"
          />
          <Button size="lg" className="w-full">Suivre ma commande</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create minimal legal pages**

```tsx
// src/app/legal/cgv/page.tsx
export const metadata = { title: 'Conditions Générales de Vente' }

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 prose prose-sm">
        <h1 className="font-bebas text-5xl text-[var(--black)] not-prose mb-8">CONDITIONS GÉNÉRALES DE VENTE</h1>
        <p className="text-[var(--grey)]">
          <strong>KITLAB</strong> — En cours de rédaction. Ces CGV seront complétées avant le lancement.
        </p>
        {/* TODO: Add full CGV text before launch */}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: FAQ, order tracking, legal pages scaffolding"
```

---

## Phase 10: Product Scraper (Python)

### Task 10.1: Yupoo Scraper Script

**Files:**
- Create: `scripts/scraper/scrape_yupoo.py`
- Create: `scripts/scraper/requirements.txt`
- Create: `scripts/scraper/README.md`

> **Important:** The supplier site (svip-1688.x.yupoo.com) requires review of their robots.txt and terms before scraping. This script is for internal use only to import your own supplier's catalog.

- [ ] **Step 1: Create requirements.txt**

```
# scripts/scraper/requirements.txt
requests==2.31.0
beautifulsoup4==4.12.3
selenium==4.18.1
supabase==2.3.1
python-dotenv==1.0.0
Pillow==10.2.0
```

- [ ] **Step 2: Create scraper script**

```python
# scripts/scraper/scrape_yupoo.py
"""
Yupoo product scraper for KITLAB.
Fetches album listings and product photos from the supplier site.
Usage: python scrape_yupoo.py --limit 10 --dry-run
"""
import os
import re
import time
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BASE_URL = "https://svip-1688.x.yupoo.com"

def slugify(text: str) -> str:
    """Convert product name to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

def parse_product_name(raw_name: str) -> dict:
    """
    Parse raw album name into structured product data.
    Expected format: "Real Madrid Domicile 24/25" or "PSG Home 2024-2025"
    """
    # This parsing will need adjustment based on actual naming convention
    parts = raw_name.strip().split()
    result = {
        "name": raw_name,
        "club": " ".join(parts[:-2]) if len(parts) > 2 else raw_name,
        "type": "domicile",  # default, adjust via mapping
        "season": "2024-2025",
    }
    for keyword, jersey_type in [
        ("domicile", "domicile"), ("home", "domicile"),
        ("extérieur", "exterieur"), ("away", "exterieur"), ("exterior", "exterieur"),
        ("third", "third"), ("troisième", "third"),
    ]:
        if keyword in raw_name.lower():
            result["type"] = jersey_type
            break
    return result

def scrape_albums(limit: int = None, dry_run: bool = False):
    """Main scraper function."""
    import requests
    from bs4 import BeautifulSoup

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })

    print(f"Fetching albums from {BASE_URL}/albums...")
    page = 1
    products_inserted = 0

    while True:
        url = f"{BASE_URL}/albums?tab=gallery&page={page}"
        resp = session.get(url, timeout=30)
        soup = BeautifulSoup(resp.text, "html.parser")

        albums = soup.select(".album__main")
        if not albums:
            print(f"No more albums at page {page}")
            break

        for album in albums:
            if limit and products_inserted >= limit:
                break

            # Extract album info
            title_el = album.select_one(".album__title")
            link_el = album.select_one("a[href]")
            if not title_el or not link_el:
                continue

            raw_name = title_el.get_text(strip=True)
            album_url = BASE_URL + link_el["href"]

            # Fetch album photos
            album_resp = session.get(album_url, timeout=30)
            album_soup = BeautifulSoup(album_resp.text, "html.parser")
            photos = [img["src"] for img in album_soup.select(".photo__img")[:3]]

            if len(photos) < 1:
                print(f"  Skipping {raw_name} — no photos found")
                continue

            parsed = parse_product_name(raw_name)
            slug = slugify(raw_name)

            product_data = {
                "slug": slug,
                "name": parsed["name"],
                "club": parsed["club"],
                "league": "À catégoriser",  # To be updated manually or via a mapping
                "country": "À définir",
                "type": parsed["type"],
                "season": parsed["season"],
                "price": 34.90,
                "photos": photos,
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "available_patches": [],
                "stock": 100,
                "is_active": False,  # Activate after review
            }

            if dry_run:
                print(f"  [DRY RUN] Would insert: {product_data['name']} ({len(photos)} photos)")
            else:
                result = supabase.table("products").upsert(product_data, on_conflict="slug").execute()
                print(f"  Inserted: {product_data['name']}")

            products_inserted += 1
            time.sleep(0.5)  # Be polite

        page += 1
        if limit and products_inserted >= limit:
            break

    print(f"\nDone. {products_inserted} products processed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    scrape_albums(limit=args.limit, dry_run=args.dry_run)
```

- [ ] **Step 3: Commit**

```bash
git add scripts/
git commit -m "feat: Yupoo scraper script for importing supplier catalog"
```

---

## Phase 11: Custom Cursor & Performance Polish

### Task 11.1: Custom Cursor

**Files:**
- Create: `src/components/ui/CustomCursor.tsx`

- [ ] **Step 1: Create cursor component**

```tsx
// src/components/ui/CustomCursor.tsx
'use client'
import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only on desktop (pointer: fine)
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let ringX = 0, ringY = 0
    let mouseX = 0, mouseY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = `${mouseX}px`
      dot.style.top = `${mouseY}px`
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`
      requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMouseMove)
    animate()
    return () => document.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
```

- [ ] **Step 2: Add to root layout**

```tsx
// In layout.tsx, inside <Providers>:
import { CustomCursor } from '@/components/ui/CustomCursor'
// ...
<CustomCursor />
```

- [ ] **Step 3: Final build check**

```bash
npm run build
```
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: custom cursor, final build verification"
```

---

## Phase 12: Vercel Deployment

### Task 12.1: Deploy to Vercel

**Files:**
- Create: `.env.local` (already exists — add production values)

- [ ] **Step 1: Install Vercel CLI**

```bash
npm i -g vercel
```

- [ ] **Step 2: Link project to Vercel**

```bash
vercel link
```
Choose: Create new project → name it `kitlab`

- [ ] **Step 3: Add environment variables**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add TELEGRAM_CHAT_ID production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_NAME production
```

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 5: Update Stripe webhook URL**

In Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://kitlab.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`
- Copy the webhook secret → update `STRIPE_WEBHOOK_SECRET` env var on Vercel

- [ ] **Step 6: Final smoke test**

- [ ] Homepage loads with fonts and design
- [ ] Products display from Supabase
- [ ] Add to cart works
- [ ] Cart drawer opens
- [ ] Checkout redirects to Stripe
- [ ] Test payment with card `4242 4242 4242 4242`
- [ ] Order appears in Supabase `orders` table
- [ ] Telegram message received

---

## Post-Launch: Phase 2 Improvements

These are not in scope for initial launch but documented for reference:

1. **Photo Enhancement Pipeline**
   - Real-ESRGAN (open source) for 4x upscaling
   - Remove.bg API (~0.10€/image) for white background
   - Estimated cost: ~117€ for 1170 images

2. **Customer Account**
   - Supabase Auth for customer login
   - `/account` page with order history
   - Order status updates

3. **Advanced Search**
   - Full-text search with Supabase `fts` columns
   - Algolia integration for instant search

4. **i18n**
   - next-intl for French/English/Spanish
   - Separate catalogs per locale

5. **Analytics**
   - Vercel Web Analytics (privacy-first, free tier)
   - Add `<Analytics />` from `@vercel/analytics`
```
