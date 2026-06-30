import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, MessageCircle, ShoppingCart, Minus, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories, fetchProductBySlug, fetchProducts } from "@/lib/db";
import { formatKES, productEnquiryMessage, whatsappUrl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Mandela Heritage` : "Product" },
      { name: "description", content: loaderData?.description?.slice(0, 160) ?? "" },
      { property: "og:image", content: loaderData?.image_urls?.[0] ?? "" },
    ],
  }),
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Product not found. <Link to="/shop" className="text-terracotta underline">Back to shop</Link></div>,
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { add } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const category = categories.find(c => c.id === product.category_id);
  const related = allProducts.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);
  const onSale = product.original_price && product.original_price > product.price;
  const images: string[] = product.image_urls.length ? product.image_urls : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900"];

  const stockLabels: Record<string, string> = { in_stock: "In Stock", out_of_stock: "Out of Stock", made_to_order: "Made to Order" };
  const stockColors: Record<string, string> = { in_stock: "bg-forest text-white", out_of_stock: "bg-destructive text-destructive-foreground", made_to_order: "bg-gold text-espresso" };
  const stockLabel = stockLabels[product.stock_status];
  const stockColor = stockColors[product.stock_status];

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
              <img src={images[activeImg]} alt={product.name} className="size-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded overflow-hidden border-2 ${i === activeImg ? "border-terracotta" : "border-transparent"}`}>
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {category && <div className="text-xs uppercase tracking-wider text-terracotta font-semibold">{category.name}</div>}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-baseline gap-3 mt-4">
              <div className="font-display text-3xl font-bold text-terracotta">{formatKES(product.price)}</div>
              {onSale && <div className="text-muted-foreground line-through">{formatKES(product.original_price!)}</div>}
            </div>
            <span className={`inline-block mt-3 text-xs font-bold px-2.5 py-1 rounded ${stockColor}`}>{stockLabel}</span>

            {product.description && <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>}

            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center border border-border rounded">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-muted"><Minus className="size-4" /></button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-2 hover:bg-muted"><Plus className="size-4" /></button>
              </div>
              <button
                onClick={() => { add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: images[0] }, qty); toast.success("Added to cart"); }}
                disabled={product.stock_status === "out_of_stock"}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-terracotta text-primary-foreground font-semibold py-3 rounded hover:bg-terracotta/90 disabled:opacity-50"
              >
                <ShoppingCart className="size-4" /> Add to Cart
              </button>
            </div>

            <a href={whatsappUrl(productEnquiryMessage(product.name, product.price, typeof window !== "undefined" ? window.location.href : undefined))} target="_blank" rel="noreferrer"
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
