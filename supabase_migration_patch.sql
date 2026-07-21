-- ============================================================
-- RESTROHUB MIGRATION PATCH — Add orders table + Realtime
-- Run this if you already ran the original supabase_schema.sql
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Add the orders table (in-flight cart orders — replaces localStorage)
-- NOTE: All column names are lowercase (PostgreSQL lowercases unquoted identifiers)
CREATE TABLE IF NOT EXISTS public.orders (
  tableid    TEXT PRIMARY KEY,
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access orders"
  ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime on the critical tables
-- (May already be enabled — the IF NOT EXISTS prevents duplicate errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'kitchen_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kitchen_orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tables'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  END IF;
END $$;
