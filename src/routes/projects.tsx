import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE_URL } from "@/lib/social";
import { MessageCircle, MapPin, Calendar, ArrowRight, Home, Building2, Coffee, Bed, Utensils, Sparkles, CheckCircle2, Ruler, Palette, Truck } from "lucide-react";
import { whatsappUrl } from "@/lib/format";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Our Projects — Custom Furniture Installations in Kenya | Mandela Heritage" },
      {
        name: "description",
        content:
          "Explore 250+ completed furniture projects across Kenya — residential homes in Karen & Runda, corporate boardrooms, hospitality fit-outs, dining sets, bedrooms and custom joinery by Mandela Heritage.",
      },
      { name: "keywords", content: "furniture projects Kenya, custom furniture Nairobi, home furnishing Karen, office fit out Westlands, hospitality furniture Kenya, bespoke furniture makers" },
      { property: "og:title", content: "Our Projects — Custom Furniture Installations Across Kenya" },
      { property: "og:description", content: "250+ homes, offices and hospitality spaces furnished by Mandela Heritage — designed, built and installed from our Mihango workshop." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/projects` },
      { property: "og:image", content: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Our Projects — Mandela Heritage Furniture Kenya" },
      { name: "twitter:description", content: "Explore our portfolio of custom furniture installations across Nairobi and beyond." },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/projects` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
              ],
            },
            {
              "@type": "CollectionPage",
              name: "Mandela Heritage Furniture Projects",
              description: "Portfolio of custom furniture installations across Kenya including residential, corporate, hospitality and dining projects.",
              url: `${SITE_URL}/projects`,
              isPartOf: { "@type": "WebSite", name: "Mandela Heritage Furnitures", url: SITE_URL },
              about: [
                { "@type": "Thing", name: "Residential Furniture" },
                { "@type": "Thing", name: "Corporate Furniture" },
                { "@type": "Thing", name: "Hospitality Furniture" },
                { "@type": "Thing", name: "Custom Joinery" },
              ],
            },
          ],
        }),
      },
    ],
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
  shopCategory?: string;
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
    shopCategory: "living-room",
  },
  {
    title: "Riverside Boardroom",
    category: "Corporate",
    location: "Westlands",
    year: "2024",
    blurb: "Executive boardroom with a 14-seat solid mahogany table and matching credenza.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000",
    shopCategory: "office",
  },
  {
    title: "Mihango Show-Home Lounge",
    category: "Interior Styling",
    location: "Mihango",
    year: "2024",
    blurb: "A modular sectional, sculpted coffee table and warm accent chairs curated for open-plan living.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000",
    span: "tall",
    shopCategory: "living-room",
  },
  {
    title: "Runda Master Suite",
    category: "Bedroom",
    location: "Runda",
    year: "2023",
    blurb: "King bed with upholstered headboard, dressing table and walk-in wardrobe fittings.",
    image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1000",
    shopCategory: "bedroom",
  },
  {
    title: "Kilimani Café Fit-Out",
    category: "Hospitality",
    location: "Kilimani",
    year: "2023",
    blurb: "Bar seating, banquettes and communal tables built for a busy artisan coffee house.",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1400",
    span: "wide",
    shopCategory: "office",
  },
  {
    title: "Syokimau Family Dining",
    category: "Dining",
    location: "Syokimau",
    year: "2023",
    blurb: "8-seat dining set with a live-edge top and hand-turned legs, matched with a sideboard.",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1000",
    shopCategory: "dining",
  },
];

const STATS = [
  { value: "250+", label: "Homes furnished" },
  { value: "40+", label: "Corporate fit-outs" },
  { value: "15", label: "Years crafting" },
  { value: "100%", label: "Kenyan-made" },
];

const CATEGORIES = [
  { icon: Home, name: "Residential", slug: "living-room", copy: "Living rooms, bedrooms & full homes tailored to how your family really lives." },
  { icon: Building2, name: "Corporate", slug: "office", copy: "Boardrooms, workstations & reception suites built for daily performance." },
  { icon: Coffee, name: "Hospitality", slug: "office", copy: "Cafés, restaurants and lounges with seating that lasts through service." },
  { icon: Bed, name: "Bedrooms", slug: "bedroom", copy: "Beds, wardrobes and dressing tables crafted from solid hardwood." },
  { icon: Utensils, name: "Dining", slug: "dining", copy: "Dining sets, sideboards and bar units that anchor the home." },
  { icon: Sparkles, name: "Custom Joinery", slug: "living-room", copy: "Built-in cabinetry, wall units and bespoke pieces to spec." },
];

const PROCESS = [
  { icon: MessageCircle, title: "Consult", copy: "Share your space, style and budget — on WhatsApp, phone or at our Mihango showroom." },
  { icon: Ruler, title: "Design & Quote", copy: "We measure, sketch options and send a transparent quote in KES with clear timelines." },
  { icon: Palette, title: "Craft", copy: "Our workshop builds your pieces from responsibly sourced hardwood and quality upholstery." },
  { icon: Truck, title: "Deliver & Install", copy: "Nationwide delivery with white-glove installation — we don't leave until it's perfect." },
];

function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-espresso text-cream" aria-labelledby="projects-hero">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center scale-105 transition-transform duration-[1200ms] hover:scale-100"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800)" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/90 to-espresso/40" aria-hidden />
          <div className="relative container-x py-14 sm:py-20 lg:py-28">
            <Reveal variant="fade-up">
              <nav aria-label="Breadcrumb" className="text-[11px] sm:text-xs tracking-widest text-cream/70 mb-4">
                <Link to="/" className="hover:text-gold transition-colors">HOME</Link>
                <span className="mx-2">/</span>
                <span className="text-gold">PROJECTS</span>
              </nav>
              <div className="text-[11px] sm:text-xs tracking-[0.35em] text-gold font-semibold">PORTFOLIO</div>
              <h1 id="projects-hero" className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mt-3 max-w-3xl leading-[1.05]">
                Spaces we've brought to life across Kenya.
              </h1>
              <p className="mt-4 sm:mt-5 max-w-2xl text-cream/85 text-sm sm:text-base lg:text-lg leading-relaxed">
                From intimate family homes in Karen to hospitality landmarks in Kilimani, every Mandela Heritage project is designed, built and installed by our Mihango team — with attention to the details that make a room feel yours.
              </p>
              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href={whatsappUrl("Hello Mandela Heritage, I'd like to discuss a project.")}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gold text-espresso px-5 sm:px-6 py-3 rounded font-semibold inline-flex items-center justify-center gap-2 hover:bg-gold/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <MessageCircle className="size-4" /> Start a project
                </a>
                <Link
                  to="/shop"
                  className="border border-cream/40 text-cream px-5 sm:px-6 py-3 rounded font-semibold inline-flex items-center justify-center gap-2 hover:bg-cream/10 hover:border-gold transition-all duration-200"
                >
                  Shop furniture <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Project statistics" className="border-b border-border bg-card">
          <div className="container-x grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="py-6 sm:py-8 text-center group cursor-default">
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-terracotta transition-transform duration-300 group-hover:scale-110">
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1 px-2">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Project categories — SEO cross-links to Shop */}
        <section aria-labelledby="project-categories" className="container-x py-12 sm:py-14">
          <SectionTitle eyebrow="WHAT WE FURNISH" title="Project Categories" />
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl -mt-2 mb-6">
            Every project draws from our full catalogue — browse the collections behind the spaces you see below.
          </p>
          <h2 id="project-categories" className="sr-only">Project Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {CATEGORIES.map((c, i) => (
              <Reveal
                key={c.name}
                delay={i * 60}
                variant="fade-up"
                className="group"
              >
                <Link
                  to="/shop"
                  search={{ category: c.slug } as any}
                  className="block h-full bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-gold hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className="size-10 sm:size-11 rounded-lg bg-terracotta/10 text-terracotta grid place-items-center mb-3 group-hover:bg-terracotta group-hover:text-cream transition-colors duration-300">
                    <c.icon className="size-5" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-espresso group-hover:text-terracotta transition-colors">{c.name}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">{c.copy}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-terracotta opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop the range <ArrowRight className="size-3" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bento gallery */}
        <section aria-labelledby="selected-projects" className="container-x pb-12 sm:pb-14">
          <SectionTitle eyebrow="RECENT WORK" title="Selected Projects" />
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl -mt-2 mb-6">
            A snapshot of homes, offices and hospitality spaces we've delivered across Nairobi and beyond.
          </p>
          <h2 id="selected-projects" className="sr-only">Selected Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[220px] sm:auto-rows-[260px] lg:auto-rows-[280px] gap-3 sm:gap-4">
            {PROJECTS.map((p, i) => (
              <Reveal
                key={p.title}
                delay={(i % 3) * 90}
                variant="fade-up"
                className={
                  (p.span === "wide" ? "sm:col-span-2 " : "") +
                  (p.span === "tall" ? "row-span-2 " : "") +
                  "group relative overflow-hidden rounded-xl bg-muted cursor-pointer"
                }
              >
                <Link
                  to="/shop"
                  search={p.shopCategory ? ({ category: p.shopCategory } as any) : undefined}
                  aria-label={`View furniture like ${p.title}`}
                  className="block absolute inset-0"
                >
                  <img
                    src={p.image}
                    alt={`${p.title} — ${p.category} furniture project in ${p.location}, ${p.year}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/70 to-transparent transition-opacity duration-500 group-hover:from-espresso/95" aria-hidden />
                  <div className="absolute top-3 left-3">
                    <span className="bg-gold/95 text-espresso text-[10px] tracking-widest uppercase font-bold px-2.5 py-1 rounded shadow-sm">
                      {p.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-cream">
                    <h3 className="font-display font-bold text-base sm:text-lg lg:text-xl leading-tight">{p.title}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-cream/85 line-clamp-2">{p.blurb}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] uppercase tracking-wider text-cream/75">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {p.location}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {p.year}</span>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      Explore similar pieces <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Process */}
        <section aria-labelledby="process" className="bg-card border-y border-border">
          <div className="container-x py-12 sm:py-16">
            <SectionTitle eyebrow="HOW WE WORK" title="From consult to installation" />
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl -mt-2 mb-8">
              A simple, transparent process refined over 15 years of furnishing Kenyan homes and businesses.
            </p>
            <h2 id="process" className="sr-only">Our Process</h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {PROCESS.map((step, i) => (
                <Reveal key={step.title} delay={i * 80} variant="fade-up">
                  <li className="relative h-full bg-background border border-border rounded-xl p-5 hover:border-terracotta hover:shadow-md transition-all duration-300 group">
                    <div className="absolute -top-3 -right-3 size-8 rounded-full bg-terracotta text-cream font-display font-bold grid place-items-center text-sm shadow-md">
                      {i + 1}
                    </div>
                    <div className="size-10 rounded-lg bg-gold/15 text-gold grid place-items-center mb-3 group-hover:bg-gold group-hover:text-espresso transition-colors">
                      <step.icon className="size-5" />
                    </div>
                    <h3 className="font-display font-bold text-espresso text-base sm:text-lg">{step.title}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.copy}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Why us */}
        <section aria-labelledby="why-us" className="container-x py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Reveal variant="fade-up">
              <div className="text-xs tracking-[0.3em] text-terracotta font-semibold">WHY MANDELA HERITAGE</div>
              <h2 id="why-us" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso mt-2">
                Craftsmanship you can feel, service you can rely on.
              </h2>
              <ul className="mt-5 space-y-3">
                {[
                  "Solid hardwood construction — no MDF shortcuts on structural pieces.",
                  "In-house workshop in Mihango, Nairobi — full control from cut to finish.",
                  "Transparent pricing in KES with signed quotes before we start.",
                  "Nationwide delivery and white-glove installation included.",
                  "12-month workmanship warranty on every custom piece.",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-sm sm:text-base text-foreground">
                    <CheckCircle2 className="size-5 text-terracotta shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal variant="fade-up" delay={120} className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1200"
                alt="Mandela Heritage craftsmen finishing a hardwood bed in the Mihango workshop"
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-espresso/10 rounded-2xl" aria-hidden />
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <Reveal as="section" variant="scale" className="container-x pb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-terracotta to-espresso p-6 sm:p-10 lg:p-12 text-cream">
            <div className="absolute -top-16 -right-16 size-64 rounded-full bg-gold/10 blur-3xl" aria-hidden />
            <div className="relative max-w-2xl">
              <div className="text-xs tracking-[0.3em] text-gold font-semibold">YOUR SPACE, NEXT</div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">Let's craft something for you.</h2>
              <p className="mt-3 text-cream/85 text-sm sm:text-base">
                Whether it's a single room refresh or a full home, we'll help you plan, source and install — with transparent pricing in KES.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href={whatsappUrl("Hello Mandela Heritage, I'd like a project quote.")}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-cream text-espresso px-5 sm:px-6 py-3 rounded font-semibold inline-flex items-center justify-center gap-2 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
                <Link
                  to="/contact"
                  className="border border-cream/50 text-cream px-5 sm:px-6 py-3 rounded font-semibold inline-flex items-center justify-center gap-2 hover:bg-cream/10 hover:border-gold transition-all duration-200"
                >
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
