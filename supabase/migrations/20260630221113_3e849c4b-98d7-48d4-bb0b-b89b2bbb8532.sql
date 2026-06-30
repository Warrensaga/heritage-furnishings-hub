
-- Admin role infrastructure
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles self read" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

-- Auto-grant admin role to allowlisted emails on signup
CREATE OR REPLACE FUNCTION public.grant_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('mandelaheritagefurniture@gmail.com', 'thinwarwarren@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_admin_on_signup();

-- Backfill: any existing allowlisted users become admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE email IN ('mandelaheritagefurniture@gmail.com', 'thinwarwarren@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Restrict write access on catalog/content tables to admins
DROP POLICY IF EXISTS "categories authed insert" ON public.categories;
DROP POLICY IF EXISTS "categories authed update" ON public.categories;
DROP POLICY IF EXISTS "categories authed delete" ON public.categories;
CREATE POLICY "categories admin insert" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "categories admin update" ON public.categories
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "categories admin delete" ON public.categories
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "products authed insert" ON public.products;
DROP POLICY IF EXISTS "products authed update" ON public.products;
DROP POLICY IF EXISTS "products authed delete" ON public.products;
CREATE POLICY "products admin insert" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "products admin update" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products admin delete" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "site_content authed insert" ON public.site_content;
DROP POLICY IF EXISTS "site_content authed update" ON public.site_content;
DROP POLICY IF EXISTS "site_content authed delete" ON public.site_content;
CREATE POLICY "site_content admin insert" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "site_content admin update" ON public.site_content
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "site_content admin delete" ON public.site_content
  FOR DELETE TO authenticated USING (public.is_admin());

-- Restrict orders read/update/delete to admins (insert remains public for checkout)
DROP POLICY IF EXISTS "orders authed read" ON public.orders;
DROP POLICY IF EXISTS "orders authed update" ON public.orders;
DROP POLICY IF EXISTS "orders authed delete" ON public.orders;
CREATE POLICY "orders admin read" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "orders admin update" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders admin delete" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin());
