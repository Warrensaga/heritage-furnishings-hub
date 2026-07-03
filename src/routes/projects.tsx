import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE_URL } from "@/lib/social";
import { MessageCircle, MapPin, Calendar, ArrowRight } from "lucide-react";
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

type Project = {
  title: string;
  category: string;
  location: string;
  year: string;
  blurb: string;
  image: string;
  span?: "wide" | "tall";
};

const PROJECTS: Project[] = [
  {
    title: "Karen Villa — Full Home Furnishing",
    category: "Residential",
    location: "Karen, Nairobi",
    year: "2024",
    blurb: "Complete furnishing across 5 bedrooms, living, dining and study — layered warm neutrals with custom hardwood cabinetry.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400",
    span: "wide",
  },
  {
    title: "Riverside Boardroom",
    category: "Corporate",
    location: "Westlands",
    year: "2024",
    blurb: "Executive boardroom with a 14-seat solid mahogany table and matching credenza.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000",
  },
  {
    title: "Mihango Show-Home Lounge",
    category: "Interior Styling",
    location: "Mihango",
    year: "2024",
    blurb: "A modular sectional, sculpted coffee table and warm accent chairs curated for open-plan living.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000",
    span: "tall",
  },
  {
    title: "Runda Master Suite",
    category: "Bedroom",
    location: "Runda",
    year: "2023",
    blurb: "King bed with upholstered headboard, dressing table and walk-in wardrobe fittings.",
    image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1000",
  },
  {
    title: "Kilimani Café Fit-Out",
    category: "Hospitality",
    location: "Kilimani",
    year: "2023",
    blurb: "Bar seating, banquettes and communal tables built for a busy artisan coffee house.",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1400",
    span: "wide",
  },
  {
    title: "Syokimau Family Dining",
    category: "Dining",
    location: "Syokimau",
    year: "2023",
    blurb: "8-seat dining set with a live-edge top and hand-turned legs, matched with a sideboard.",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1000",
  },
];

const STATS = [
  { value: "250+", label: "Homes furnished" },
  { value: "40+", label: "Corporate fit-outs" },
  { value: "15", label: "Years crafting" },
  { value: "100%", label: "Kenyan-made" },
];

function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-espresso text-cream">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800)" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/85 to-espresso/40" aria-hidden />
          <div className="relative container-x py-16 sm:py-24">
            <Reveal variant="fade-up">
              <div className="text-xs tracking-[0.35em] text-gold font-semibold">PORTFOLIO</div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold mt-3 max-w-3xl leading-tight">
                Spaces we've brought to life across Kenya.
              </h1>
              <p className="mt-5 max-w-2xl text-cream/80 text-base sm:text-lg leading-relaxed">
                From intimate family homes to hospitality landmarks, every project is designed, built and installed by our Mihango team — with attention to the details that make a room feel yours.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappUrl("Hello Mandela Heritage, I'd like to discuss a project.")} target="_blank" rel="noreferrer" className="bg-gold text-espresso px-6 py-3 rounded font-semibold inline-flex items-center gap-2 hover:bg-gold/90">
                  <MessageCircle className="size-4" /> Start a project
                </a>
                <Link to="/shop" className="border border-cream/40 text-cream px-6 py-3 rounded font-semibold hover:bg-cream/10">
                  Shop furniture
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border bg-card">
          <div className="container-x grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="py-6 sm:py-8 text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold text-terracotta">{s.value}</div>
                <div className="text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bento gallery */}
        <section className="container-x py-14">
          <SectionTitle eyebrow="RECENT WORK" title="Selected Projects" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[240px] sm:auto-rows-[280px] gap-4">
            {PROJECTS.map((p, i) => (
              <Reveal
                key={p.title}
                delay={(i % 3) * 90}
                variant="fade-up"
                className={
                  (p.span === "wide" ? "sm:col-span-2 " : "") +
                  (p.span === "tall" ? "row-span-2 " : "") +
                  "group relative overflow-hidden rounded-xl bg-muted"
                }
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-transparent" aria-hidden />
                <div className="absolute top-3 left-3">
                  <span className="bg-gold/95 text-espresso text-[10px] tracking-widest uppercase font-bold px-2.5 py-1 rounded">
                    {p.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-cream">
                  <h3 className="font-display font-bold text-lg sm:text-xl leading-tight">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-cream/85 line-clamp-2">{p.blurb}</p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] uppercase tracking-wider text-cream/75">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {p.location}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {p.year}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Reveal as="section" variant="scale" className="container-x pb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-terracotta to-espresso p-8 sm:p-12 text-cream">
            <div className="max-w-2xl">
              <div className="text-xs tracking-[0.3em] text-gold font-semibold">YOUR SPACE, NEXT</div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold mt-2">Let's craft something for you.</h2>
              <p className="mt-3 text-cream/85 text-sm sm:text-base">
                Whether it's a single room refresh or a full home, we'll help you plan, source and install — with transparent pricing in KES.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={whatsappUrl("Hello Mandela Heritage, I'd like a project quote.")} target="_blank" rel="noreferrer" className="bg-cream text-espresso px-6 py-3 rounded font-semibold inline-flex items-center gap-2 hover:bg-cream/90">
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
                <Link to="/contact" className="border border-cream/50 text-cream px-6 py-3 rounded font-semibold inline-flex items-center gap-2 hover:bg-cream/10">
                  Contact Us <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
