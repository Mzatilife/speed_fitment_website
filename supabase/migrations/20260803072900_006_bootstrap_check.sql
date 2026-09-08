/*
# SpeedFitment — Public bootstrap check function

Adds a SECURITY DEFINER function `is_bootstrap_mode()` that returns true
when no profiles exist yet. This lets the public signup page show only
when the system has no admin (first-run bootstrap).

After the first admin is created, the signup page hides itself and
all new users must be created by an admin via the admin panel.
*/

CREATE OR REPLACE FUNCTION public.is_bootstrap_mode()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles);
$$;

GRANT EXECUTE ON FUNCTION public.is_bootstrap_mode() TO anon, authenticated;