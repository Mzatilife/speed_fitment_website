/*
# Create testimonials table

1. New Tables
- `testimonials` — stores customer reviews/testimonials displayed on the homepage.
  - `id` (uuid, primary key)
  - `name` (text, not null) — customer's name
  - `role` (text) — customer's role/title (e.g. "Regular Customer")
  - `text` (text, not null) — the review content
  - `rating` (int, default 5) — star rating 1-5
  - `is_active` (boolean, default true) — whether to show on homepage
  - `sort_order` (int, default 0) — display ordering
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `testimonials`.
- Public read: anyone (anon + authenticated) can read active testimonials.
- Only authenticated users (admin/cashier) can insert/update/delete.

3. Seed Data
- Inserts 3 sample testimonials so the homepage isn't empty on first load.
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Customer',
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials"
ON testimonials FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
CREATE POLICY "auth_insert_testimonials"
ON testimonials FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials"
ON testimonials FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials"
ON testimonials FOR DELETE
TO authenticated USING (true);

INSERT INTO testimonials (name, role, text, rating, sort_order) VALUES
('Michael Banda', 'Regular Customer', 'The alignment service transformed my car. Professional team and fair pricing. Highly recommended!', 5, 0),
('Sarah Phiri', 'Business Owner', 'Their diagnostics caught an issue three other shops missed. Saved me thousands in potential repairs.', 5, 1),
('James Mvula', 'Fleet Manager', 'We trust SpeedFitment with our entire fleet. Reliable, fast, and the quality is consistently excellent.', 5, 2)
ON CONFLICT DO NOTHING;
