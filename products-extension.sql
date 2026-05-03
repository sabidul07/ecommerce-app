-- ============================================================
-- ATELIER — ADVANCED PRODUCT SCHEMA
-- ============================================================

-- Add new columns for filtering
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Uncategorized',
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5,
  ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 10;

-- Add indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price    ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating   ON public.products(rating);

-- Enable full-text search support
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(category, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products USING GIN (fts);
