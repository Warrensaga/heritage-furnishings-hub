import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "How long does delivery take?", a: "In-stock items deliver within 1–3 working days in Nairobi. Made-to-order pieces typically take 2–4 weeks." },
  { q: "How much is delivery?", a: "Free delivery within Nairobi on orders over KSh 30,000. Below that, delivery fees start from KSh 1,500 depending on location." },
  { q: "What is your returns policy?", a: "We accept returns of unused, in-original-condition items within 7 days of delivery. Custom orders are non-returnable." },
  { q: "How does M-Pesa payment work?", a: "After confirming your order on WhatsApp, we send you our Paybill / Till number. Payment can be on delivery or as agreed." },
  { q: "Can I order custom furniture?", a: "Yes — share dimensions, fabric and finish preferences via WhatsApp and we'll quote within 24 hours." },
  { q: "Is installation included?", a: "Yes — free installation is included on all orders within Nairobi." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Mandela Heritage" }, { name: "description", content: "Delivery, returns, M-Pesa, custom orders." }] }),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-10 max-w-3xl">
        <h1 className="font-display text-4xl font-bold">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="mt-6 bg-card border border-border rounded-lg p-2">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="px-3 text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="px-3 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  ),
});
