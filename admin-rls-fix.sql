-- ATELIER — ADMIN RLS PERMISSIONS FIX
-- Run this in your Supabase SQL Editor to allow admins to see all data.

-- 1. Profiles: Allow admins to read all profiles
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 2. Orders: Allow admins to read all orders
DROP POLICY IF EXISTS "orders: admin read all" ON public.orders;
CREATE POLICY "orders: admin read all"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 3. Order Items: Allow admins to read all order items
DROP POLICY IF EXISTS "order_items: admin read all" ON public.order_items;
CREATE POLICY "order_items: admin read all"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 4. Products: Allow admins to update/delete any product
DROP POLICY IF EXISTS "products: admin update all" ON public.products;
CREATE POLICY "products: admin update all"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "products: admin delete all" ON public.products;
CREATE POLICY "products: admin delete all"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
