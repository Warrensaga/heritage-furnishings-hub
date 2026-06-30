import { Link } from "@tanstack/react-router";
import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/db";
import { formatKES, productEnquiryMessage, whatsappUrl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

const badgeColor: Record<string, string> = {
  "BEST SELLER": "bg-terracotta text-white",
  "NEW": "bg-forest text-white",
  "SALE": "bg-gold text-espresso",
};

export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { add } = useCart();
  const img = product.image_urls[0] ?? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600";
  const onSale = product.original_price && product.original_price > product.price;

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link to="/shop/$slug" params={{ slug: product.slug }} className="relative aspect-square bg-muted overflow-hidden">
        <img src={img} alt={product.name} loading="lazy" className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold tracking-wider px-2 py-1 rounded ${badgeColor[product.badge] ?? "bg-espresso text-cream"}`}>
            {product.badge}
          </span>
        )}
        {product.stock_status === "out_of_stock" && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded bg-destructive text-destructive-foreground">OUT OF STOCK</span>
        )}
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        {categoryName && <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{categoryName}</div>}
        <Link to="/shop/$slug" params={{ slug: product.slug }} className="font-medium text-sm mt-1 line-clamp-2 hover:text-terracotta">
          {product.name}
        </Link>
        <div className="flex items-center gap-0.5 mt-1 text-gold">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3 fill-current" />)}
        </div>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <div className="font-display font-bold text-terracotta">{formatKES(product.price)}</div>
            {onSale && <div className="text-xs text-muted-foreground line-through">{formatKES(product.original_price!)}</div>}
          </div>
          <div className="mt-2 flex gap-1.5">
            <button
              onClick={() => { add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: img }); toast.success("Added to cart"); }}
              disabled={product.stock_status === "out_of_stock"}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-espresso text-cream text-xs font-semibold py-2 rounded hover:bg-espresso/90 disabled:opacity-50"
            >
              <ShoppingCart className="size-3.5" /> Add
            </button>
            <a
              href={whatsappUrl(productEnquiryMessage(product.name, product.price, typeof window !== "undefined" ? `${window.location.origin}/shop/${product.slug}` : undefined))}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-whatsapp text-white px-3 rounded hover:bg-whatsapp/90"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
