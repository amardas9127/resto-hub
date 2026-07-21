-- ============================================================
-- RESTROHUB SUPABASE DATABASE SCHEMA  (Full / Final)
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Tables
CREATE TABLE IF NOT EXISTS public.tables (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  seats      INTEGER NOT NULL DEFAULT 4,
  status     TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  price      NUMERIC NOT NULL,
  category   TEXT NOT NULL,
  available  BOOLEAN DEFAULT TRUE,
  image      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kitchen Orders
CREATE TABLE IF NOT EXISTS public.kitchen_orders (
  id        TEXT PRIMARY KEY,
  "tableId" TEXT NOT NULL,
  "tableName" TEXT,
  items     JSONB NOT NULL DEFAULT '[]'::jsonb,
  status    TEXT NOT NULL DEFAULT 'pending',
  billed    BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bills
CREATE TABLE IF NOT EXISTS public.bills (
  id              TEXT PRIMARY KEY,
  "tableId"       TEXT NOT NULL,
  "tableName"     TEXT,
  "customerName"  TEXT,
  "customerPhone" TEXT,
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal        NUMERIC NOT NULL,
  tax             NUMERIC NOT NULL,
  "taxRate"       NUMERIC DEFAULT 0.05,
  discount        NUMERIC DEFAULT 0,
  total           NUMERIC NOT NULL,
  "paymentMethod" TEXT DEFAULT 'cash',
  "createdAt"     TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  email      TEXT,
  status     TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sub Users (Staff PIN logins)
CREATE TABLE IF NOT EXISTS public.sub_users (
  id         TEXT PRIMARY KEY,
  username   TEXT NOT NULL,
  pin        TEXT NOT NULL,
  role       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders (In-flight cart orders per table — replaces localStorage)
CREATE TABLE IF NOT EXISTS public.orders (
  "tableId"   TEXT PRIMARY KEY,
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.tables        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;

-- Public full access policies (anon key is sufficient for this app)
CREATE POLICY "Public full access tables"         ON public.tables         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access menu_items"     ON public.menu_items     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access kitchen_orders" ON public.kitchen_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bills"          ON public.bills          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access employees"      ON public.employees      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access sub_users"      ON public.sub_users      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access orders"         ON public.orders         FOR ALL USING (true) WITH CHECK (true);

-- ── Storage Bucket (Menu Images) ────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access to menu-items images"
ON storage.objects FOR ALL
USING (bucket_id = 'menu-items')
WITH CHECK (bucket_id = 'menu-items');

-- ── Enable Realtime on critical tables ─────────────────────
-- Run in Supabase Dashboard → Database → Replication, or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.kitchen_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;

-- ── Seed Data ───────────────────────────────────────────────

-- Default Tables
INSERT INTO public.tables (id, name, seats, status) VALUES
  ('T1', 'Table 1', 4, 'available'),
  ('T2', 'Table 2', 2, 'available'),
  ('T3', 'Table 3', 6, 'available'),
  ('T4', 'Table 4', 4, 'available')
ON CONFLICT (id) DO NOTHING;

-- Default Menu Items
INSERT INTO public.menu_items (id, name, price, category, available, image) VALUES
  ('M1',  'Margherita Pizza',  299, 'Main Course', true, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80'),
  ('M2',  'Caesar Salad',      199, 'Starters',    true, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=80'),
  ('M3',  'Grilled Chicken',   399, 'Main Course', true, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=80'),
  ('M4',  'Pasta Carbonara',   349, 'Main Course', true, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80'),
  ('M5',  'Garlic Bread',      149, 'Starters',    true, 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80'),
  ('M6',  'Tomato Soup',       129, 'Starters',    true, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80'),
  ('M7',  'Chocolate Brownie', 179, 'Desserts',    true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80'),
  ('M8',  'Masala Chai',        49, 'Beverages',   true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80'),
  ('M9',  'Cold Coffee',       129, 'Beverages',   true, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80'),
  ('M10', 'Paneer Tikka',      249, 'Starters',    true, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80'),
  ('M11', 'Butter Chicken',    379, 'Main Course', true, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80'),
  ('M12', 'Dal Makhani',       249, 'Main Course', true, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80'),
  ('M13', 'Naan',               49, 'Breads',      true, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80'),
  ('M14', 'Biryani',           329, 'Main Course', true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'),
  ('M15', 'Gulab Jamun',        99, 'Desserts',    true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80'),
  ('M16', 'Fresh Lime Soda',    79, 'Beverages',   true, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- Default Employees
INSERT INTO public.employees (id, name, role, email, status) VALUES
  ('E1', 'Amit Patel',  'Head Waiter', 'amit@restrohub.com',  'active'),
  ('E2', 'Ravi Kumar',  'Chef',        'ravi@restrohub.com',  'active'),
  ('E3', 'Sneha Rao',   'Waitstaff',   'sneha@restrohub.com', 'active'),
  ('E4', 'Priya Singh', 'Sous Chef',   'priya@restrohub.com', 'active'),
  ('E5', 'Mohan Das',   'Staff',       'mohan@restrohub.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Default Sub-users (Staff PIN logins)
INSERT INTO public.sub_users (id, username, pin, role) VALUES
  ('W1', 'Amit Patel',  '1234', 'waiter'),
  ('W2', 'Sneha Rao',   '2222', 'waiter'),
  ('C1', 'Ravi Kumar',  '3333', 'chef'),
  ('C2', 'Priya Singh', '4444', 'chef'),
  ('S1', 'Mohan Das',   '5555', 'staff')
ON CONFLICT (id) DO NOTHING;
