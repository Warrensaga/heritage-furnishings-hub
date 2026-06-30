import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { formatKES, orderConfirmationMessage, whatsappUrl } from "@/lib/format";

export const Route = createFileRoute("/checkout/success/$id")({
  head: () => ({ meta: [{ title: "Order Placed — Mandela Heritage" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const waLink = order ? whatsappUrl(orderConfirmationMessage({
    orderId: order.id,
    name: order.customer_name,
    phone: order.phone,
    address: order.delivery_address,
    items: (order.items as any[]).map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: order.total,
  })) : "";

  useEffect(() => {
    if (waLink && typeof window !== "undefined") {
      const t = setTimeout(() => { window.open(waLink, "_blank"); }, 800);
      return () => clearTimeout(t);
    }
  }, [waLink]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-12">
        <div className="max-w-xl mx-auto bg-card border border-border rounded-lg p-8 text-center">
          <CheckCircle2 className="size-14 text-forest mx-auto" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-4">Order received!</h1>
          {isLoading ? (
            <p className="text-muted-foreground mt-3">Loading your order...</p>
          ) : order ? (
            <>
              <p className="text-muted-foreground mt-3">
                Order <span className="font-mono font-bold text-espresso">#{order.id.slice(0, 8).toUpperCase()}</span> · Total {formatKES(order.total)}
              </p>
              <p className="text-sm mt-4">A WhatsApp message has been prepared for you to send. Please click below to confirm with our team.</p>
              <a href={waLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 bg-whatsapp text-white font-semibold px-6 py-3 rounded hover:bg-whatsapp/90">
                <MessageCircle className="size-5" /> Confirm on WhatsApp
              </a>
              <Link to="/shop" className="block mt-4 text-sm text-muted-foreground hover:text-terracotta">Continue shopping</Link>
            </>
          ) : (
            <p className="text-muted-foreground mt-3">Order not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
