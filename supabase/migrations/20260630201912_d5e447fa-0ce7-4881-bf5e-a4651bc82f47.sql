
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories authed insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categories authed update" ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "categories authed delete" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price int NOT NULL,
  original_price int,
  description text,
  image_urls text[] NOT NULL DEFAULT '{}',
  stock_status text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','out_of_stock','made_to_order')),
  badge text CHECK (badge IS NULL OR badge IN ('BEST SELLER','NEW','SALE')),
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products authed insert" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products authed update" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "products authed delete" ON public.products FOR DELETE TO authenticated USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  delivery_address text NOT NULL,
  items jsonb NOT NULL,
  total int NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','fulfilled','cancelled')),
  notes text
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders public insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "orders authed read" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders authed update" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "orders authed delete" ON public.orders FOR DELETE TO authenticated USING (true);

CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content public read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_content authed insert" ON public.site_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "site_content authed update" ON public.site_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "site_content authed delete" ON public.site_content FOR DELETE TO authenticated USING (true);

INSERT INTO public.categories (name, slug, icon_url, display_order) VALUES
('Sofas & Seating','sofas-seating','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',1),
('Dining Sets','dining-sets','https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=400',2),
('Bedroom Furniture','bedroom-furniture','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400',3),
('Office Furniture','office-furniture','https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400',4),
('Storage & Shelving','storage-shelving','https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400',5),
('Outdoor Furniture','outdoor-furniture','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',6),
('Coffee & Side Tables','coffee-side-tables','https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400',7),
('Custom/Bespoke','custom-bespoke','https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400',8);

WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (name, slug, category_id, price, original_price, description, image_urls, stock_status, badge, featured) VALUES
('Heritage 3-Seater Fabric Sofa','heritage-3-seater-sofa',(SELECT id FROM c WHERE slug='sofas-seating'),65000,80000,'Spacious 3-seater sofa upholstered in premium linen blend with solid mahogany frame.',ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900'],'in_stock','BEST SELLER',true),
('Mandela Recliner Armchair','mandela-recliner-armchair',(SELECT id FROM c WHERE slug='sofas-seating'),38500,NULL,'Single-seat recliner with adjustable backrest, padded armrests and bonded leather finish.',ARRAY['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900'],'in_stock','NEW',true),
('L-Shaped 6-Seater Sectional','l-shaped-6-seater-sectional',(SELECT id FROM c WHERE slug='sofas-seating'),145000,180000,'Generous L-shaped sectional perfect for family living rooms. Reversible chaise.',ARRAY['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900'],'in_stock','SALE',true),
('Solid Oak 6-Seater Dining Set','solid-oak-6-seater-dining',(SELECT id FROM c WHERE slug='dining-sets'),95000,NULL,'6-seater dining table with cushioned chairs in solid oak finish.',ARRAY['https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=900'],'in_stock','BEST SELLER',true),
('Compact 4-Seater Dining Table','compact-4-seater-dining',(SELECT id FROM c WHERE slug='dining-sets'),48000,NULL,'Space-saving 4-seater dining set ideal for apartments.',ARRAY['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=900'],'in_stock',NULL,false),
('Executive 8-Seater Dining Set','executive-8-seater-dining',(SELECT id FROM c WHERE slug='dining-sets'),185000,220000,'Premium 8-seater dining table with upholstered high-back chairs.',ARRAY['https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=900'],'made_to_order','SALE',true),
('Heritage King Size Bed','heritage-king-bed',(SELECT id FROM c WHERE slug='bedroom-furniture'),85000,NULL,'King-size bed frame with upholstered headboard and mahogany side panels.',ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900'],'in_stock','BEST SELLER',true),
('Queen Size Bed with Storage','queen-bed-with-storage',(SELECT id FROM c WHERE slug='bedroom-furniture'),62000,NULL,'Queen bed with hydraulic storage and quilted leatherette headboard.',ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900'],'in_stock','NEW',false),
('6-Drawer Bedroom Dresser','6-drawer-dresser',(SELECT id FROM c WHERE slug='bedroom-furniture'),34000,NULL,'Six-drawer dresser with smooth gliders and brushed gold handles.',ARRAY['https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900'],'in_stock',NULL,false),
('Executive Leather Office Chair','executive-office-chair',(SELECT id FROM c WHERE slug='office-furniture'),28500,35000,'Ergonomic executive chair with high back, lumbar support and bonded leather.',ARRAY['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=900'],'in_stock','SALE',true),
('L-Shape Executive Desk','l-shape-executive-desk',(SELECT id FROM c WHERE slug='office-furniture'),58000,NULL,'L-shaped executive desk with side drawers and cable management.',ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=900'],'in_stock','BEST SELLER',true),
('Mesh Task Chair','mesh-task-chair',(SELECT id FROM c WHERE slug='office-furniture'),12500,NULL,'Breathable mesh task chair with adjustable height and tilt.',ARRAY['https://images.unsplash.com/photo-1505797149-35ebcaf52aae?w=900'],'in_stock',NULL,false),
('5-Tier Open Bookshelf','5-tier-bookshelf',(SELECT id FROM c WHERE slug='storage-shelving'),22000,NULL,'Five-tier open bookshelf in espresso finish.',ARRAY['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=900'],'in_stock',NULL,false),
('4-Door Wardrobe','4-door-wardrobe',(SELECT id FROM c WHERE slug='storage-shelving'),72000,NULL,'Spacious four-door wardrobe with mirror and internal shoe rack.',ARRAY['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=900'],'in_stock','NEW',true),
('TV Stand with Storage','tv-stand-storage',(SELECT id FROM c WHERE slug='storage-shelving'),18500,24000,'Modern TV stand for up to 65" screens with cabinets and open shelves.',ARRAY['https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=900'],'in_stock','SALE',false),
('Outdoor Rattan 4-Seater Set','outdoor-rattan-4-seater',(SELECT id FROM c WHERE slug='outdoor-furniture'),68000,NULL,'Weather-resistant rattan set with two armchairs, sofa and coffee table.',ARRAY['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900'],'in_stock','BEST SELLER',true),
('Garden Bench Acacia Wood','garden-bench-acacia',(SELECT id FROM c WHERE slug='outdoor-furniture'),15500,NULL,'Solid acacia wood garden bench treated for outdoor use.',ARRAY['https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=900'],'in_stock',NULL,false),
('Marble-Top Coffee Table','marble-top-coffee-table',(SELECT id FROM c WHERE slug='coffee-side-tables'),28000,NULL,'Round marble-top coffee table with brushed gold base.',ARRAY['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=900'],'in_stock','NEW',true),
('Nesting Side Tables (Set of 2)','nesting-side-tables',(SELECT id FROM c WHERE slug='coffee-side-tables'),9500,NULL,'Set of two nesting side tables in walnut finish.',ARRAY['https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=900'],'in_stock',NULL,false),
('Custom Bespoke Living Room','custom-bespoke-living-room',(SELECT id FROM c WHERE slug='custom-bespoke'),250000,NULL,'Tailored living room package designed to your space, fabric and finish.',ARRAY['https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=900'],'made_to_order',NULL,true);

INSERT INTO public.site_content (key, value) VALUES
('carousel_slides', $$[
  {"category":"SOFAS & SEATING","headline":"Premium Comfort for Your Living Room","subtext":"At Discounted Price · Free Delivery Nairobi","image":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800","cta_link":"/shop?category=sofas-seating"},
  {"category":"BEDROOM FURNITURE","headline":"Bedrooms Built for Restful Nights","subtext":"King & Queen sets · Free installation","image":"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1800","cta_link":"/shop?category=bedroom-furniture"},
  {"category":"DINING SETS","headline":"Gather Around Heritage","subtext":"4, 6 & 8-seater dining sets in solid wood","image":"https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=1800","cta_link":"/shop?category=dining-sets"},
  {"category":"OFFICE FURNITURE","headline":"Workspaces That Mean Business","subtext":"Executive desks, ergonomic chairs, full office fit-outs","image":"https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1800","cta_link":"/shop?category=office-furniture"}
]$$::jsonb),
('promo_banner_text', '"Free Delivery on Orders Over KSh 30,000 · M-Pesa Accepted · Free Installation · Reply Within 1 Hour · Eastern Bypass, Nairobi"'::jsonb),
('promo_banner_active', 'true'::jsonb),
('featured_product_ids', '[]'::jsonb);
