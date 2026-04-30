-- ============================================================
-- ATELIER — PROFILE PAGE MIGRATION
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Extend profiles table
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name            TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone                TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url           TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "order_status": true,
    "promotions": true,
    "back_in_stock": false,
    "newsletter": true
  }'::jsonb;

-- ─────────────────────────────────────────────
-- 2. Addresses table
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  line1         TEXT NOT NULL DEFAULT '',
  line2         TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT '',
  state         TEXT NOT NULL DEFAULT '',
  pincode       TEXT NOT NULL DEFAULT '',
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- ─────────────────────────────────────────────
-- 3. RLS for addresses
-- ─────────────────────────────────────────────

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses: read own" ON public.addresses;
CREATE POLICY "addresses: read own"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses: insert own" ON public.addresses;
CREATE POLICY "addresses: insert own"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses: update own" ON public.addresses;
CREATE POLICY "addresses: update own"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses: delete own" ON public.addresses;
CREATE POLICY "addresses: delete own"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 4. Avatars storage bucket
-- ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars: auth upload" ON storage.objects;
CREATE POLICY "avatars: auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars: owner update" ON storage.objects;
CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars: owner delete" ON storage.objects;
CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────
-- 5. Account deletion function (DPDP compliance)
-- ─────────────────────────────────────────────
-- This function anonymises user data before deletion.
-- Call it from a secure server-side API route using the service role key.

CREATE OR REPLACE FUNCTION public.delete_user_account(uid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Anonymise personal data in profiles
  UPDATE public.profiles
    SET full_name = '[deleted]',
        phone     = '',
        avatar_url = NULL,
        notification_preferences = '{}'::jsonb
  WHERE id = uid;

  -- Delete saved addresses
  DELETE FROM public.addresses WHERE user_id = uid;

  -- Delete the auth user (cascades to profiles via FK)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;
