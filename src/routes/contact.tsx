import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Showroom — Mandela Heritage Furnitures" },
      { name: "description", content: "Visit our showroom on Eastern Bypass, Mihango, Nairobi. Call or chat with us on WhatsApp." },
      { property: "og:title", content: "Contact Mandela Heritage Furnitures" },
      { property: "og:description", content: "Visit our showroom or chat on WhatsApp." },
      { property: "og:url", content: "https://kenyan-furniture-suite.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://kenyan-furniture-suite.lovable.app/contact" }],
  }),

  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-10">
        <h1 className="font-display text-4xl font-bold">Contact Us</h1>
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="flex gap-3"><MapPin className="size-5 text-terracotta shrink-0 mt-0.5" /><div><div className="font-semibold">Showroom</div><div className="text-sm text-muted-foreground">{BUSINESS_ADDRESS}</div></div></div>
            <div className="flex gap-3"><Phone className="size-5 text-terracotta shrink-0 mt-0.5" /><div><div className="font-semibold">Phone</div><a href={`tel:+${WHATSAPP_NUMBER}`} className="text-sm text-muted-foreground hover:text-terracotta">+{WHATSAPP_NUMBER}</a></div></div>
            <div className="flex gap-3"><Mail className="size-5 text-terracotta shrink-0 mt-0.5" /><div><div className="font-semibold">Email</div><a href={`mailto:${BUSINESS_EMAIL}`} className="text-sm text-muted-foreground hover:text-terracotta break-all">{BUSINESS_EMAIL}</a></div></div>
            <a href={whatsappUrl("Hello!")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-whatsapp text-white font-semibold px-5 py-2.5 rounded hover:bg-whatsapp/90"><MessageCircle className="size-4" /> Chat on WhatsApp</a>
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border border-border">
              <iframe title="Map" loading="lazy" className="size-full" src="https://www.google.com/maps?q=Mihango+Eastern+Bypass+Nairobi&output=embed" />
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault();
            const m = `Hello, I'm ${form.name} (${form.phone}${form.email ? ", " + form.email : ""}). ${form.message}`;
            window.open(whatsappUrl(m), "_blank");
            toast.success("Opening WhatsApp...");
          }} className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="font-display text-xl font-bold">Send a message</h2>
            <input required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            <input required type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
            <input type="email" placeholder="Email (optional)" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
            <textarea required rows={5} placeholder="Your message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input" />
            <button className="w-full bg-terracotta text-primary-foreground font-semibold py-3 rounded hover:bg-terracotta/90">Send via WhatsApp</button>
            <style>{`.input{width:100%;background:var(--input);border:1px solid var(--border);border-radius:6px;padding:10px 12px;font-size:14px;outline:none} .input:focus{border-color:var(--terracotta)}`}</style>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
