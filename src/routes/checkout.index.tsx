import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Mandela Heritage" }] }),
  component: CheckoutPage,
});

const Schema = z.object({
  customer_name: z.string().trim().min(2, "Name required").max(120),
  phone: z.string().trim().min(7, "Phone required").max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  delivery_address: z.string().trim().min(5, "Delivery address required").max(500),
  notes: z.string().trim().max(500).optional(),
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", delivery_address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    const parsed = Schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the form."); return; }

    setSubmitting(true);
    try {
      const id = (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const payload = {
        id,
        customer_name: parsed.data.customer_name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        delivery_address: parsed.data.delivery_address,
        notes: parsed.data.notes || null,
        total: subtotal,
        items: items.map(i => ({ id: i.id, slug: i.slug, name: i.name, price: i.price, qty: i.qty })),
      };
      const { error } = await supabase.from("orders").insert(payload);
      if (error) throw error;
      // Cache for the success page (anon cannot SELECT orders).
      try {
        sessionStorage.setItem(`order:${id}`, JSON.stringify({ ...payload, created_at: new Date().toISOString(), status: "new" }));
      } catch {}
      clear();
      navigate({ to: "/checkout/success/$id", params: { id } });
    } catch (err: any) {
      console.error(err);
      toast.error("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container-x py-10 text-center">
          <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
          <Link to="/shop" className="inline-block mt-4 bg-terracotta text-primary-foreground px-5 py-2.5 rounded font-semibold">Continue Shopping</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-8">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">No payment now — we'll confirm via WhatsApp and arrange M-Pesa, cash or bank transfer.</p>

        <form onSubmit={onSubmit} className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <Field label="Full Name *"><input required value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} className="input" /></Field>
            <Field label="Phone (WhatsApp) *"><input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXX" className="input" /></Field>
            <Field label="Email (optional)"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></Field>
            <Field label="Delivery Address *"><textarea required value={form.delivery_address} onChange={e => setForm(f => ({ ...f, delivery_address: e.target.value }))} rows={3} placeholder="Estate, road, building, landmark" className="input" /></Field>
            <Field label="Notes (optional)"><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input" /></Field>
          </div>

          <aside className="bg-card border border-border rounded-lg p-5 h-fit lg:sticky lg:top-44">
            <h2 className="font-display font-bold text-lg">Order Summary</h2>
            <ul className="mt-4 divide-y divide-border text-sm">
              {items.map(it => (
                <li key={it.id} className="py-2 flex justify-between gap-2">
                  <span className="truncate">{it.name} <span className="text-muted-foreground">x{it.qty}</span></span>
                  <span className="whitespace-nowrap">{formatKES(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-border flex justify-between font-bold">
              <span>Total</span><span className="text-terracotta font-display">{formatKES(subtotal)}</span>
            </div>
            <button disabled={submitting} className="mt-5 w-full bg-terracotta text-primary-foreground font-semibold py-3 rounded hover:bg-terracotta/90 disabled:opacity-50">
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </aside>
        </form>
      </main>
      <Footer />

      <style>{`.input{width:100%;background:var(--input);border:1px solid var(--border);border-radius:6px;padding:10px 12px;font-size:14px;outline:none} .input:focus{border-color:var(--terracotta)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-xs font-semibold mb-1.5">{label}</div>{children}</label>;
}
