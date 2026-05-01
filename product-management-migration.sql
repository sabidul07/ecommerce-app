-- Comprehensive Product Management Migration

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES public.categories(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Update Products Table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft' CHECK (status IN ('Active', 'Draft', 'Archived')),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 3. Product Images Table (for multiple images)
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title       TEXT NOT NULL, -- e.g. "Size: M, Color: Blue"
  price       NUMERIC(10, 2),
  sku         TEXT,
  inventory_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
DROP POLICY IF EXISTS "categories: public read" ON public.categories;
CREATE POLICY "categories: public read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_images: public read" ON public.product_images;
CREATE POLICY "product_images: public read" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_variants: public read" ON public.product_variants;
CREATE POLICY "product_variants: public read" ON public.product_variants FOR SELECT USING (true);

-- Admin CRUD policies (assuming is_admin check in profiles)
DO $$
BEGIN
    -- categories admin
    EXECUTE 'DROP POLICY IF EXISTS "categories: admin crud" ON public.categories';
    EXECUTE 'CREATE POLICY "categories: admin crud" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))';
    
    -- product_images admin
    EXECUTE 'DROP POLICY IF EXISTS "product_images: admin crud" ON public.product_images';
    EXECUTE 'CREATE POLICY "product_images: admin crud" ON public.product_images FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))';

    -- product_variants admin
    EXECUTE 'DROP POLICY IF EXISTS "product_variants: admin crud" ON public.product_variants';
    EXECUTE 'CREATE POLICY "product_variants: admin crud" ON public.product_variants FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))';

    -- products admin CRUD (extend existing if needed, but here we overwrite for admin)
    EXECUTE 'DROP POLICY IF EXISTS "products: admin crud" ON public.products';
    EXECUTE 'CREATE POLICY "products: admin crud" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))';
END $$;
