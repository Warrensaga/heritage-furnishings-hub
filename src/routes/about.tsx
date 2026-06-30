import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Mandela Heritage Furnitures" }, { name: "description", content: "15 years of handcrafted furniture for Kenyan homes." }] }),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-10 max-w-3xl">
        <h1 className="font-display text-4xl font-bold">About Mandela Heritage</h1>
        <p className="mt-4 text-muted-foreground">For over 15 years, our family workshop on the Eastern Bypass has crafted furniture that families pass on. We work in solid Kenyan hardwoods — mahogany, mvule, cypress — and finish every piece by hand.</p>
        <h2 className="font-display text-2xl font-bold mt-10">Our mission</h2>
        <p className="mt-2 text-muted-foreground">To make heirloom-quality furniture accessible to every Kenyan home and office.</p>
        <h2 className="font-display text-2xl font-bold mt-10">Visit our showroom</h2>
        <p className="mt-2 text-muted-foreground">Eastern Bypass, Mihango, Nairobi<br />Mon–Sat: 8am – 6pm · Sun: 10am – 4pm</p>
      </main>
      <Footer />
    </div>
  ),
});
