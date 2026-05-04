-- ============================================================
-- ATELIER — PREMIUM ENHANCEMENTS MIGRATION V1
-- ============================================================

-- 1. Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 2. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  images      TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Loyalty & Points
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points      INTEGER DEFAULT 0,
  tier        TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  history     JSONB DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Style Quiz Results
CREATE TABLE IF NOT EXISTS public.style_quiz_results (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  style_type  TEXT NOT NULL,
  results     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Extend Profiles for Artisan Verification
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_artisan BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Unverified' CHECK (verification_status IN ('Unverified', 'Pending', 'Verified')),
  ADD COLUMN IF NOT EXISTS artisan_bio TEXT,
  ADD COLUMN IF NOT EXISTS artisan_story TEXT,
  ADD COLUMN IF NOT EXISTS specialty_tags TEXT[] DEFAULT '{}';

-- 6. RLS Policies
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_quiz_results ENABLE ROW LEVEL SECURITY;

-- Wishlists: Own read/write
CREATE POLICY "wishlists: own crud" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Reviews: Public read, own insert, own delete
CREATE POLICY "reviews: public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews: auth insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews: own delete" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Loyalty: Own read
CREATE POLICY "loyalty: own read" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);

-- Style Quiz: Own read/write
CREATE POLICY "quiz: own crud" ON public.style_quiz_results FOR ALL USING (auth.uid() = user_id);

-- 8. Community Features
CREATE TABLE IF NOT EXISTS public.community_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  product_id  UUID REFERENCES public.products(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.artisan_spotlights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  cover_image TEXT,
  interview_json JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_spotlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_posts: public read" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "community_posts: auth insert" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "spotlights: public read" ON public.artisan_spotlights FOR SELECT USING (true);


-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON public.community_posts(user_id);

