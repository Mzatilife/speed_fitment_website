/*
# SpeedFitment — Transactional Tables

Creates bookings, orders, payments, and messages tables with RLS.
- Anyone (including anon) can create bookings and messages
- Anyone can create orders and payments (for POS / walk-in customers)
- Customers can view their own bookings/orders/payments
- Staff can view and manage all transactional data
*/

-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text DEFAULT '',
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL DEFAULT '',
  vehicle_make text DEFAULT '',
  vehicle_model text DEFAULT '',
  vehicle_year text DEFAULT '',
  preferred_date date,
  preferred_time text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  assigned_to text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_own_or_staff" ON public.bookings;
CREATE POLICY "bookings_select_own_or_staff" ON public.bookings
  FOR SELECT TO anon, authenticated
  USING (
    user_id = auth.uid()
    OR public.is_staff()
    OR (user_id IS NULL AND auth.uid() IS NULL)
  );

DROP POLICY IF EXISTS "bookings_insert_anyone" ON public.bookings;
CREATE POLICY "bookings_insert_anyone" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_update_own_or_staff" ON public.bookings;
CREATE POLICY "bookings_update_own_or_staff" ON public.bookings
  FOR UPDATE TO anon, authenticated
  USING (user_id = auth.uid() OR public.is_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "bookings_delete_staff" ON public.bookings;
CREATE POLICY "bookings_delete_staff" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cashier_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own_or_staff" ON public.orders;
CREATE POLICY "orders_select_own_or_staff" ON public.orders
  FOR SELECT TO anon, authenticated
  USING (
    user_id = auth.uid()
    OR public.is_staff()
    OR (user_id IS NULL AND auth.uid() IS NULL)
  );

DROP POLICY IF EXISTS "orders_insert_anyone" ON public.orders;
CREATE POLICY "orders_insert_anyone" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_update_own_or_staff" ON public.orders;
CREATE POLICY "orders_update_own_or_staff" ON public.orders
  FOR UPDATE TO anon, authenticated
  USING (user_id = auth.uid() OR public.is_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "orders_delete_staff" ON public.orders;
CREATE POLICY "orders_delete_staff" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cashier_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash', 'mobile_money', 'card', 'bank_transfer')),
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'refunded')),
  reference text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own_or_staff" ON public.payments;
CREATE POLICY "payments_select_own_or_staff" ON public.payments
  FOR SELECT TO anon, authenticated
  USING (
    user_id = auth.uid()
    OR public.is_staff()
    OR (user_id IS NULL AND auth.uid() IS NULL)
  );

DROP POLICY IF EXISTS "payments_insert_anyone" ON public.payments;
CREATE POLICY "payments_insert_anyone" ON public.payments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "payments_update_staff" ON public.payments;
CREATE POLICY "payments_update_staff" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "payments_delete_staff" ON public.payments;
CREATE POLICY "payments_delete_staff" ON public.payments
  FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text DEFAULT 'General Inquiry',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_public_insert" ON public.messages;
CREATE POLICY "messages_public_insert" ON public.messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "messages_staff_read" ON public.messages;
CREATE POLICY "messages_staff_read" ON public.messages
  FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "messages_staff_update" ON public.messages;
CREATE POLICY "messages_staff_update" ON public.messages
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "messages_staff_delete" ON public.messages;
CREATE POLICY "messages_staff_delete" ON public.messages
  FOR DELETE TO authenticated
  USING (public.is_staff());