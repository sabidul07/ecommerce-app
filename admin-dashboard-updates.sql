-- Migration to support Admin Dashboard features

-- Add inventory_count to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 0;

-- Add status to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Cancelled'));

-- Create payments table for revenue tracking
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount      NUMERIC(10, 2) NOT NULL,
  status      TEXT DEFAULT 'Succeeded',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins can read all payments
DROP POLICY IF EXISTS "payments: admin read" ON public.payments;
CREATE POLICY "payments: admin read"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Users can see their own payments
DROP POLICY IF EXISTS "payments: user read" ON public.payments;
CREATE POLICY "payments: user read"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Add category column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

-- Verify RLS for public read on products (redundant but safe)
DROP POLICY IF EXISTS "products: public read" ON public.products;
CREATE POLICY "products: public read"
  ON public.products FOR SELECT
  USING (true);

-- Seed featured products (Requires at least one admin profile to exist)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get the first admin ID
    SELECT id INTO admin_id FROM public.profiles WHERE is_admin = true LIMIT 1;

    -- If no admin exists, we can't seed properly
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.products (title, price, category, is_featured, image, user_id, inventory_count)
        VALUES
         ('Ceramic vase', 1850, 'Home', true, 'https://images.unsplash.com/photo-1578749553550-41399557ed36?q=80&w=800&auto=format&fit=crop', admin_id, 15),
         ('Brass earrings', 950, 'Accessories', true, 'https://images.unsplash.com/photo-1535633302703-b07204658ce3?q=80&w=800&auto=format&fit=crop', admin_id, 24),
         ('Raku tea set', 3200, 'Ceramics', true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop', admin_id, 8),
         ('Linen print', 700, 'Art', true, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop', admin_id, 40)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
