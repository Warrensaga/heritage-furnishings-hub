import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/social";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/format";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Our Projects — Mandela Heritage Furnitures" },
      { name: "description", content: "Explore completed furniture projects by Mandela Heritage — homes, offices, hospitality and custom builds across Kenya." },
      { property: "og:title", content: "Our Projects — Mandela Heritage" },
      { property: "og:description", content: "Explore completed furniture projects by Mandela Heritage across Kenya." },
      { property: "og:url", content: `${SITE_URL}/projects` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/projects` }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-10 sm:py-14">
        <div className="max-w-2xl">
          <div className="text-xs tracking-[0.3em] text-terracotta font-semibold">PORTFOLIO</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">Our Projects</h1>
          <p className="mt-3 text-muted-foreground">
            From family homes on the Eastern Bypass to boardrooms in Westlands, we deliver furniture that lasts. Our full project gallery is launching soon.
          </p>
        </div>

        <div className="mt-10 border border-dashed border-border rounded-lg p-10 text-center bg-card">
          <h2 className="font-display text-xl font-bold">Project gallery coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            We're compiling photos and details from recent installations. In the meantime, get in touch and we'll share references relevant to your space.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link to="/contact" className="bg-espresso text-cream px-5 py-2.5 rounded font-semibold text-sm hover:bg-espresso/90">Contact Us</Link>
            <a href={whatsappUrl("Hello Mandela Heritage, I'd like to see project references.")} target="_blank" rel="noreferrer" className="bg-whatsapp text-white px-5 py-2.5 rounded font-semibold text-sm hover:bg-whatsapp/90 inline-flex items-center gap-2">
              <MessageCircle className="size-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
