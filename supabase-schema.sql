-- ============================================================
-- ATELIER — SUPABASE DATABASE SCHEMA
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────

-- Profiles: one row per user, created on sign-up
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products: items listed for sale
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  image       TEXT,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders: one order per checkout
CREATE TABLE IF NOT EXISTS public.orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total       NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items: products inside each order
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL CHECK (quantity > 0)
);

-- ─────────────────────────────────────────────
-- 2. INDEXES (performance)
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_user_id    ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ─────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ── profiles ──
-- Users can read and update their own profile
DROP POLICY IF EXISTS "profiles: read own" ON public.profiles;
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: insert own" ON public.profiles;
CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── products ──
-- Anyone (even anonymous) can read products
DROP POLICY IF EXISTS "products: public read" ON public.products;
CREATE POLICY "products: public read"
  ON public.products FOR SELECT
  USING (true);

-- Only authenticated users can insert
DROP POLICY IF EXISTS "products: auth insert" ON public.products;
CREATE POLICY "products: auth insert"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update their own products
DROP POLICY IF EXISTS "products: owner update" ON public.products;
CREATE POLICY "products: owner update"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

-- Owners can delete their own products
DROP POLICY IF EXISTS "products: owner delete" ON public.products;
CREATE POLICY "products: owner delete"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- ── orders ──
-- Users can only see their own orders
DROP POLICY IF EXISTS "orders: read own" ON public.orders;
CREATE POLICY "orders: read own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders: insert own" ON public.orders;
CREATE POLICY "orders: insert own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders: delete own" ON public.orders;
CREATE POLICY "orders: delete own"
  ON public.orders FOR DELETE
  USING (auth.uid() = user_id);

-- ── order_items ──
-- Users can see items for their own orders only
DROP POLICY IF EXISTS "order_items: read own" ON public.order_items;
CREATE POLICY "order_items: read own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items: insert own" ON public.order_items;
CREATE POLICY "order_items: insert own"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 4. STORAGE BUCKET
-- ─────────────────────────────────────────────

-- Create the "images" bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the images bucket
DROP POLICY IF EXISTS "images: auth upload" ON storage.objects;
CREATE POLICY "images: auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

-- Allow public read of any image in the images bucket
DROP POLICY IF EXISTS "images: public read" ON storage.objects;
CREATE POLICY "images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Allow owners to delete their own images
DROP POLICY IF EXISTS "images: owner delete" ON storage.objects;
CREATE POLICY "images: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────
-- 5. TRIGGER: auto-create profile on sign-up
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
