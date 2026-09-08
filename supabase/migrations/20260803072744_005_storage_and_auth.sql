/*
# SpeedFitment — Storage Bucket & Auth Updates

## Overview
1. Creates a public storage bucket `images` for uploading service/part/logistics images
2. Updates the `handle_new_user` trigger to respect a role passed in metadata (for admin-created users)
3. Adds `profile_count()` helper to detect bootstrap state

## Storage
- Bucket `images` is public (readable by anyone)
- Authenticated users can upload (admin/cashier manage content)
- Users can delete their own uploads

## Auth Changes
- handle_new_user now checks raw_app_meta_data for a 'role' key
  - If present and valid, uses that role (for admin-created users via edge function)
  - If absent, defaults to 'customer' (or 'admin' if no profiles exist — bootstrap)
*/

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
CREATE POLICY "images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'images');

-- Authenticated can upload
DROP POLICY IF EXISTS "images_auth_upload" ON storage.objects;
CREATE POLICY "images_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Uploader can delete their own files
DROP POLICY IF EXISTS "images_owner_delete" ON storage.objects;
CREATE POLICY "images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid());

-- Uploader can update/overwrite their own files
DROP POLICY IF EXISTS "images_owner_update" ON storage.objects;
CREATE POLICY "images_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'images' AND owner = auth.uid());

-- ============================================================
-- HELPER: profile count (for bootstrap detection)
-- ============================================================

CREATE OR REPLACE FUNCTION public.profile_count()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.profiles;
$$;

-- ============================================================
-- UPDATED: handle_new_user trigger
-- Now respects a 'role' key in raw_app_meta_data
-- so admin-created users (via edge function) get the correct role
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_role text;
  meta_role text;
BEGIN
  -- Check if a role was specified in metadata (by the edge function)
  meta_role := NEW.raw_app_meta_data->>'role';

  IF meta_role IN ('admin', 'cashier', 'customer') THEN
    new_role := meta_role;
  ELSE
    -- Bootstrap: first user becomes admin, rest are customers
    SELECT CASE WHEN COUNT(*) = 0 THEN 'admin' ELSE 'customer' END
    INTO new_role FROM public.profiles;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    new_role
  );
  RETURN NEW;
END;
$$;