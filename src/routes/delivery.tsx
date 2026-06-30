import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery — Mandela Heritage" }, { name: "description", content: "Delivery zones, timelines, free delivery threshold." }] }),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-10 max-w-3xl">
        <h1 className="font-display text-4xl font-bold">Delivery Information</h1>
        <h2 className="font-display text-xl font-bold mt-8">Zones</h2>
        <p className="text-muted-foreground mt-2">We deliver across Nairobi and surrounding counties. Long-distance delivery (Mombasa, Kisumu, Nakuru, etc.) is available — quoted per order.</p>
        <h2 className="font-display text-xl font-bold mt-6">Timeline</h2>
        <ul className="text-muted-foreground mt-2 list-disc pl-5 space-y-1">
          <li>Nairobi: 1–3 working days for in-stock items</li>
          <li>Made-to-order: 2–4 weeks</li>
          <li>Upcountry: 4–7 working days</li>
        </ul>
        <h2 className="font-display text-xl font-bold mt-6">Free Delivery</h2>
        <p className="text-muted-foreground mt-2">Free delivery within Nairobi on orders over KSh 30,000. Installation is also free.</p>
      </main>
      <Footer />
    </div>
  ),
});
