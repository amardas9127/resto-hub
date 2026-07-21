-- ============================================================
-- RESTROHUB SUPABASE UPDATE PATCH
-- Copy and paste this script into your Supabase Dashboard:
-- SQL Editor -> New Query -> Run
-- Use this if you ALREADY executed the initial base schema!
-- ============================================================

-- 1. Add optional Customer details columns to public.bills
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS customerName TEXT;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS customerPhone TEXT;

-- 2. Add Image URL column to public.menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image TEXT;

-- 3. Update existing menu items with default image URLs
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80' WHERE id = 'M1';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=80' WHERE id = 'M2';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=80' WHERE id = 'M3';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80' WHERE id = 'M4';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80' WHERE id = 'M5';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80' WHERE id = 'M6';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80' WHERE id = 'M7';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' WHERE id = 'M8';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80' WHERE id = 'M9';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80' WHERE id = 'M10';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80' WHERE id = 'M11';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80' WHERE id = 'M12';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80' WHERE id = 'M13';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' WHERE id = 'M14';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80' WHERE id = 'M15';
UPDATE public.menu_items SET image = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' WHERE id = 'M16';

-- 4. Create Public Storage Bucket 'menu-items' for uploaded image files
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policy allowing public reads and uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public access to menu-items images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public access to menu-items images"
    ON storage.objects FOR ALL
    USING (bucket_id = 'menu-items')
    WITH CHECK (bucket_id = 'menu-items');
  END IF;
END $$;
