import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight, MessageCircle, ShoppingCart, Minus, Plus, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import {
  fetchCategories,
  fetchProductBySlug,
  fetchProducts,
  fetchProductVariations,
  fetchVariationTypes,
  fetchVariationValues,
  type ProductVariation,
} from "@/lib/db";
import { formatKES, productEnquiryMessage, whatsappUrl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    const variations = await fetchProductVariations(product.id);
    return { product, variations };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.product;
    const variations = loaderData?.variations ?? [];
    const url = `https://kenyan-furniture-suite.lovable.app/shop/${params.slug}`;
    const desc = p?.description?.slice(0, 160) ?? `${p?.name} — premium furniture from Mandela Heritage, Nairobi.`;
    const image = p?.image_urls?.[0] ?? "";

    const availabilityFor = (s: string) =>
      s === "in_stock" ? "https://schema.org/InStock"
        : s === "out_of_stock" ? "https://schema.org/OutOfStock"
        : s === "low_stock" ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/PreOrder";

    let ld: any;
    if (p && variations.length > 0) {
      ld = {
        "@context": "https://schema.org",
        "@type": "ProductGroup",
        name: p.name,
        description: p.description ?? undefined,
        image: p.image_urls ?? undefined,
        productGroupID: p.id,
        variesBy: Array.from(new Set(variations.flatMap(v => Object.keys(v.attributes ?? {})))),
        hasVariant: variations.map(v => ({
          "@type": "Product",
          name: `${p.name} — ${Object.values(v.attributes ?? {}).join(", ")}`,
          sku: v.sku,
          image: v.image_urls?.length ? v.image_urls : p.image_urls,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "KES",
            price: v.price,
            availability: availabilityFor(v.stock_status),
          },
        })),
      };
    } else if (p) {
      ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description ?? undefined,
        image: p.image_urls ?? undefined,
        sku: p.id,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "KES",
          price: p.price,
          availability: availabilityFor(p.stock_status),
        },
      };
    }

    return {
      meta: [
        { title: p ? `${p.name} — Mandela Heritage` : "Product" },
        { name: "description", content: desc },
        { property: "og:title", content: p?.name ?? "Product" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: ld ? [{ type: "application/ld+json", children: JSON.stringify(ld) }] : [],
    };
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Product not found. <Link to="/shop" className="text-terracotta underline">Back to shop</Link></div>,
  component: ProductPage,
});

const stockLabels: Record<string, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
  made_to_order: "Made to Order",
  low_stock: "Low Stock",
};
const stockColors: Record<string, string> = {
  in_stock: "bg-forest text-white",
  out_of_stock: "bg-destructive text-destructive-foreground",
  made_to_order: "bg-gold text-espresso",
  low_stock: "bg-terracotta text-white",
};

function ProductPage() {
  const { product, variations } = Route.useLoaderData() as { product: any; variations: ProductVariation[] };
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: types = [] } = useQuery({ queryKey: ["variation_types"], queryFn: fetchVariationTypes, enabled: variations.length > 0 });
  const { data: values = [] } = useQuery({ queryKey: ["variation_values"], queryFn: fetchVariationValues, enabled: variations.length > 0 });
  const { add } = useCart();

  const hasVariations = variations.length > 0;

  // Build set of attribute keys used and default selection
  const attributeKeys = useMemo(() => {
    const set = new Set<string>();
    for (const v of variations) for (const k of Object.keys(v.attributes ?? {})) set.add(k);
    return Array.from(set);
  }, [variations]);

  const defaultVariation = variations.find(v => v.is_default) ?? variations[0];
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => defaultVariation?.attributes ?? {});
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  // Resolve current variation from selected attrs (must match all keys)
  const currentVariation: ProductVariation | undefined = useMemo(() => {
    if (!hasVariations) return undefined;
    return variations.find(v =>
      attributeKeys.every(k => (v.attributes?.[k] ?? "") === (selectedAttrs[k] ?? ""))
    ) ?? defaultVariation;
  }, [variations, selectedAttrs, attributeKeys, hasVariations, defaultVariation]);

  // Effective product presentation values
  const effImages = (currentVariation?.image_urls?.length ? currentVariation.image_urls : product.image_urls) ?? [];
  const images = effImages.length ? effImages : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900"];
  const effPrice = currentVariation?.price ?? product.price;
  const effOriginal = currentVariation?.original_price ?? product.original_price;
  const effStock = currentVariation?.stock_status ?? product.stock_status;
  const effDescription = currentVariation?.description || product.description;
  const effSku = currentVariation?.sku;
  const effDelivery = currentVariation?.delivery_days;
  const effDimensions = currentVariation?.dimensions;

  const onSale = effOriginal && effOriginal > effPrice;
  const category = categories.find(c => c.id === product.category_id);
  const related = allProducts.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);

  // Helpers for selector: which values are available for a given attribute key,
  // and which are compatible with current selections on other keys.
  const availableFor = (key: string) => {
    const seen = new Set<string>();
    for (const v of variations) {
      const val = v.attributes?.[key];
      if (val) seen.add(val);
    }
    return Array.from(seen);
  };
  const isCompatible = (key: string, val: string) => {
    return variations.some(v => {
      if (v.attributes?.[key] !== val) return false;
      return attributeKeys.every(k => k === key || !selectedAttrs[k] || v.attributes?.[k] === selectedAttrs[k]);
    });
  };
  const swatchFor = (val: string) => {
    const type = types.find(t => availableFor(t.name).includes(val));
    if (!type) return null;
    return values.find(x => x.variation_type_id === type.id && x.value === val)?.swatch_hex ?? null;
  };

  const setAttr = (key: string, val: string) => {
    setSelectedAttrs(prev => ({ ...prev, [key]: val }));
    setActiveImg(0);
  };

  const variationLabel = currentVariation
    ? Object.entries(currentVariation.attributes ?? {}).map(([k, v]) => `${k}: ${v}`).join(", ")
    : undefined;

  const addToCart = () => {
    const cartId = currentVariation ? `${product.id}:${currentVariation.id}` : product.id;
    add({
      id: cartId,
      productId: product.id,
      variationId: currentVariation?.id,
      variationLabel,
      sku: effSku,
      slug: product.slug,
      name: currentVariation ? `${product.name} — ${Object.values(currentVariation.attributes ?? {}).join(", ")}` : product.name,
      price: effPrice,
      image: images[0],
    }, qty);
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-5">
          <Link to="/" className="hover:text-terracotta">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/shop" className="hover:text-terracotta">Shop</Link>
          {category && <><ChevronRight className="size-3" /><Link to="/shop" search={{ category: category.slug } as any} className="hover:text-terracotta">{category.name}</Link></>}
          <ChevronRight className="size-3" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                key={images[activeImg]}
                src={images[activeImg]}
                alt={product.name}
                className="size-full object-cover animate-in fade-in duration-300"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((img: string, i: number) => (
                  <button key={img + i} onClick={() => setActiveImg(i)} className={`aspect-square rounded overflow-hidden border-2 transition-colors ${i === activeImg ? "border-terracotta" : "border-transparent"}`}>
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {hasVariations && variations.some(v => v.image_urls?.length) && (
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-espresso mb-2">
                  Choose a variation
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {variations.filter(v => v.image_urls?.length).map(v => {
                    const active = currentVariation?.id === v.id;
                    const label = Object.values(v.attributes ?? {}).join(" / ");
                    return (
                      <button
                        key={v.id}
                        onClick={() => { setSelectedAttrs(v.attributes ?? {}); setActiveImg(0); }}
                        className={`group text-left rounded-lg overflow-hidden border-2 transition-all ${active ? "border-terracotta shadow-md" : "border-border hover:border-espresso"}`}
                      >
                        <div className="aspect-square bg-muted overflow-hidden">
                          <img src={v.image_urls[0]} alt={label} className="size-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="text-[11px] font-semibold truncate">{label || v.sku}</div>
                          <div className="text-[11px] text-terracotta font-bold">{formatKES(v.price)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            {category && <div className="text-xs uppercase tracking-wider text-terracotta font-semibold">{category.name}</div>}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">{product.name}</h1>

            <div key={`price-${currentVariation?.id ?? "base"}`} className="animate-in fade-in duration-200">
              <div className="flex items-baseline gap-3 mt-4">
                <div className="font-display text-3xl font-bold text-terracotta">{formatKES(effPrice)}</div>
                {onSale && <div className="text-muted-foreground line-through">{formatKES(effOriginal!)}</div>}
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded ${stockColors[effStock]}`}>{stockLabels[effStock]}</span>
                {effSku && <span className="text-xs text-muted-foreground font-mono">SKU: {effSku}</span>}
              </div>
              {effDelivery != null && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Truck className="size-4" />
                  {effStock === "made_to_order" ? `Made to order — ships in ${effDelivery} days` : `Ships in ${effDelivery} ${effDelivery === 1 ? "day" : "days"}`}
                </div>
              )}
            </div>

            {/* Variation selectors */}
            {hasVariations && attributeKeys.map(key => {
              const options = availableFor(key);
              const isColor = key.toLowerCase().includes("color");
              return (
                <div key={key} className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-espresso mb-2">
                    {key}: <span className="font-normal normal-case text-foreground/70">{selectedAttrs[key] ?? "Select"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.map(opt => {
                      const active = selectedAttrs[key] === opt;
                      const compatible = isCompatible(key, opt);
                      const swatch = isColor ? swatchFor(opt) : null;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAttr(key, opt)}
                          disabled={!compatible}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all ${
                            active ? "border-terracotta bg-terracotta/10 text-terracotta font-semibold" : "border-border hover:border-espresso"
                          } ${!compatible ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                        >
                          {swatch && <span className="size-4 rounded-full border border-border" style={{ background: swatch }} />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {effDescription && (
              <div className="mt-6 border-t border-border pt-5">
                <h2 className="font-display text-lg font-bold text-espresso mb-2">Description</h2>
                <p key={`desc-${currentVariation?.id ?? "base"}`} className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line animate-in fade-in duration-200">
                  {effDescription}
                </p>
              </div>
            )}

            {effDimensions && (effDimensions.length || effDimensions.width || effDimensions.height) && (
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-espresso">Dimensions:</span>{" "}
                {[effDimensions.length, effDimensions.width, effDimensions.height].filter(Boolean).join(" × ")} {effDimensions.unit ?? "cm"}
                {currentVariation?.weight_kg ? ` · ${currentVariation.weight_kg} kg` : ""}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center border border-border rounded">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-muted"><Minus className="size-4" /></button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-2 hover:bg-muted"><Plus className="size-4" /></button>
              </div>
              <button
                onClick={addToCart}
                disabled={effStock === "out_of_stock"}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-terracotta text-primary-foreground font-semibold py-3 rounded hover:bg-terracotta/90 disabled:opacity-50"
              >
                <ShoppingCart className="size-4" /> Add to Cart
              </button>
            </div>

            <a href={whatsappUrl(productEnquiryMessage(currentVariation ? `${product.name} (${Object.values(currentVariation.attributes ?? {}).join(", ")})` : product.name, effPrice))} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-whatsapp text-white font-semibold py-3 rounded hover:bg-whatsapp/90">
              <MessageCircle className="size-4" /> Enquire on WhatsApp
            </a>

            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
              <li>✓ Free delivery in Nairobi on orders over KSh 30,000</li>
              <li>✓ Free installation included</li>
              <li>✓ M-Pesa, cash, or bank transfer accepted</li>
              <li>✓ Showroom: Eastern Bypass, Mihango</li>
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-5">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} categoryName={category?.name} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
