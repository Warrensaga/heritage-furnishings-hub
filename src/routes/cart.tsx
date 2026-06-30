import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Mandela Heritage" }] }),
  component: CartPage,
});

const FREE_DELIVERY = 30000;

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const remaining = Math.max(0, FREE_DELIVERY - subtotal);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-8">
        <h1 className="font-display text-3xl font-bold">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 text-center bg-card border border-border rounded-lg p-12">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="inline-block mt-4 bg-terracotta text-primary-foreground px-5 py-2.5 rounded font-semibold hover:bg-terracotta/90">Continue Shopping</Link>
          </div>
        ) : (
          <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {items.map(it => (
                <div key={it.id} className="p-4 flex gap-4">
                  <img src={it.image} alt={it.name} className="size-20 sm:size-24 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <Link to="/shop/$slug" params={{ slug: it.slug }} className="font-medium hover:text-terracotta line-clamp-2">{it.name}</Link>
                    <div className="text-terracotta font-display font-bold mt-1">{formatKES(it.price)}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center border border-border rounded">
                        <button onClick={() => setQty(it.id, it.qty - 1)} className="p-1.5"><Minus className="size-3.5" /></button>
                        <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} className="p-1.5"><Plus className="size-3.5" /></button>
                      </div>
                      <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive p-1.5" aria-label="Remove"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                  <div className="font-semibold text-right whitespace-nowrap">{formatKES(it.price * it.qty)}</div>
                </div>
              ))}
            </div>

            <aside className="bg-card border border-border rounded-lg p-5 h-fit lg:sticky lg:top-44">
              <h2 className="font-display font-bold text-lg">Order Summary</h2>
              <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{formatKES(subtotal)}</span></div>
              <div className="mt-2 text-xs text-muted-foreground">
                {remaining > 0 ? `Add ${formatKES(remaining)} more for free delivery.` : "🎉 You qualify for free delivery!"}
              </div>
              <Link to="/checkout" className="mt-5 block text-center bg-terracotta text-primary-foreground font-semibold py-3 rounded hover:bg-terracotta/90">Proceed to Checkout</Link>
              <Link to="/shop" className="mt-2 block text-center text-sm text-muted-foreground hover:text-terracotta">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
