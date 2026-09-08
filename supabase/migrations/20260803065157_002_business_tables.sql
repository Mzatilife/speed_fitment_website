/*
# SpeedFitment — Business Data Tables

Creates services, parts, logistics, and settings tables with RLS.
- Public can read all these tables
- Staff (admin/cashier) can manage them via is_staff() helper
- Settings is a singleton (id=1) writable only by admin
*/

-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(12,2) DEFAULT 0,
  price_label text DEFAULT '',
  category text DEFAULT 'General',
  features text[] DEFAULT '{}',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "services_staff_write" ON public.services;
CREATE POLICY "services_staff_write" ON public.services
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ============================================================
-- PARTS (INVENTORY)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'General',
  price numeric(12,2) DEFAULT 0,
  stock_quantity int DEFAULT 0,
  low_stock_threshold int DEFAULT 5,
  sku text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  is_on_sale boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parts_public_read" ON public.parts;
CREATE POLICY "parts_public_read" ON public.parts
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "parts_staff_write" ON public.parts;
CREATE POLICY "parts_staff_write" ON public.parts
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ============================================================
-- LOGISTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.logistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(12,2) DEFAULT 0,
  unit text DEFAULT 'per load',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "logistics_public_read" ON public.logistics;
CREATE POLICY "logistics_public_read" ON public.logistics
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "logistics_staff_write" ON public.logistics;
CREATE POLICY "logistics_staff_write" ON public.logistics
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ============================================================
-- SETTINGS (singleton)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  id int PRIMARY KEY DEFAULT 1,
  business_name text NOT NULL DEFAULT 'SpeedFitment',
  tagline text DEFAULT 'Premium Auto Services',
  phone text DEFAULT '(+265) 456-7890',
  email text DEFAULT 'support@speedfitment.com',
  address text DEFAULT '123 AutoCare St, Car City, CA 12345',
  hours jsonb DEFAULT '{"mon_fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb,
  map_lat numeric DEFAULT -13.9626,
  map_lng numeric DEFAULT 33.7745,
  hero_image text DEFAULT '',
  about text DEFAULT 'Experience excellence in automotive care with our comprehensive services',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "settings_admin_write" ON public.settings;
CREATE POLICY "settings_admin_write" ON public.settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;