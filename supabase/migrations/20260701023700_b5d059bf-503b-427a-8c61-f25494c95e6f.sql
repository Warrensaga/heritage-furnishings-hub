-- Variation types catalog
CREATE TABLE public.variation_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.variation_types TO anon, authenticated;
GRANT ALL ON public.variation_types TO service_role;
ALTER TABLE public.variation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variation_types public read" ON public.variation_types FOR SELECT TO public USING (true);
CREATE POLICY "variation_types admin insert" ON public.variation_types FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "variation_types admin update" ON public.variation_types FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "variation_types admin delete" ON public.variation_types FOR DELETE TO authenticated USING (is_admin());

-- Variation values (reusable across products)
CREATE TABLE public.variation_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variation_type_id uuid NOT NULL REFERENCES public.variation_types(id) ON DELETE CASCADE,
  value text NOT NULL,
  slug text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  swatch_hex text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (variation_type_id, slug)
);
CREATE INDEX ON public.variation_values (variation_type_id);
GRANT SELECT ON public.variation_values TO anon, authenticated;
GRANT ALL ON public.variation_values TO service_role;
ALTER TABLE public.variation_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variation_values public read" ON public.variation_values FOR SELECT TO public USING (true);
CREATE POLICY "variation_values admin insert" ON public.variation_values FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "variation_values admin update" ON public.variation_values FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "variation_values admin delete" ON public.variation_values FOR DELETE TO authenticated USING (is_admin());

-- Product variations
CREATE TABLE public.product_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  price integer NOT NULL,
  original_price integer,
  stock_status text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','out_of_stock','made_to_order','low_stock')),
  delivery_days integer,
  weight_kg numeric,
  dimensions jsonb,
  description text,
  image_urls text[] NOT NULL DEFAULT '{}',
  attributes jsonb NOT NULL DEFAULT '{}',
  is_default boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.product_variations (product_id);
CREATE INDEX ON public.product_variations USING GIN (attributes);
CREATE UNIQUE INDEX product_variations_combo_unique ON public.product_variations (product_id, attributes);

GRANT SELECT ON public.product_variations TO anon, authenticated;
GRANT ALL ON public.product_variations TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.product_variations TO authenticated;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_variations public read" ON public.product_variations FOR SELECT TO public USING (true);
CREATE POLICY "product_variations admin insert" ON public.product_variations FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "product_variations admin update" ON public.product_variations FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "product_variations admin delete" ON public.product_variations FOR DELETE TO authenticated USING (is_admin());

-- Seed default variation types
INSERT INTO public.variation_types (name, slug, display_order) VALUES
  ('Size', 'size', 1),
  ('Color', 'color', 2),
  ('Wood Finish', 'wood-finish', 3),
  ('Material', 'material', 4),
  ('Fabric', 'fabric', 5),
  ('Cushion Color', 'cushion-color', 6),
  ('Leg Finish', 'leg-finish', 7),
  ('Table Shape', 'table-shape', 8),
  ('Mattress Size', 'mattress-size', 9),
  ('Upholstery Type', 'upholstery-type', 10)
ON CONFLICT (slug) DO NOTHING;