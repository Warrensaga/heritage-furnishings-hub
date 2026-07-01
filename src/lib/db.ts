import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  display_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price: number;
  original_price: number | null;
  description: string | null;
  image_urls: string[];
  stock_status: "in_stock" | "out_of_stock" | "made_to_order";
  badge: "BEST SELLER" | "NEW" | "SALE" | null;
  featured: boolean;
  created_at: string;
};

export type CarouselSlide = {
  category: string;
  headline: string;
  subtext: string;
  image: string;
  cta_link: string;
};

export type VariationType = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
};

export type VariationValue = {
  id: string;
  variation_type_id: string;
  value: string;
  slug: string;
  display_order: number;
  swatch_hex: string | null;
};

export type VariationStockStatus = "in_stock" | "out_of_stock" | "made_to_order" | "low_stock";

export type ProductVariation = {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  original_price: number | null;
  stock_status: VariationStockStatus;
  delivery_days: number | null;
  weight_kg: number | null;
  dimensions: { length?: number; width?: number; height?: number; unit?: string } | null;
  description: string | null;
  image_urls: string[];
  attributes: Record<string, string>;
  is_default: boolean;
  display_order: number;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("display_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as Product | null) ?? null;
}

export async function fetchSiteContent(key: string): Promise<any> {
  const { data, error } = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export function categoryCountMap(products: Product[]) {
  const map = new Map<string, number>();
  for (const p of products) if (p.category_id) map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1);
  return map;
}

// ---------- Variations ----------

export async function fetchVariationTypes(): Promise<VariationType[]> {
  const { data, error } = await (supabase as any).from("variation_types").select("*").order("display_order");
  if (error) throw error;
  return (data ?? []) as VariationType[];
}

export async function fetchVariationValues(): Promise<VariationValue[]> {
  const { data, error } = await (supabase as any).from("variation_values").select("*").order("display_order");
  if (error) throw error;
  return (data ?? []) as VariationValue[];
}

export async function fetchProductVariations(productId: string): Promise<ProductVariation[]> {
  const { data, error } = await (supabase as any)
    .from("product_variations")
    .select("*")
    .eq("product_id", productId)
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as ProductVariation[];
}
