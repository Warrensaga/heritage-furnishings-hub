import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Truck, ShieldCheck, Wrench, Heart, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SectionTitle } from "@/components/SectionTitle";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { fetchCategories, fetchProducts, categoryCountMap } from "@/lib/db";
import { whatsappUrl } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mandela Heritage Furnitures — Premium Furniture in Nairobi" },
      { name: "description", content: "Shop sofas, dining sets, beds, office & outdoor furniture. Free delivery in Nairobi over KSh 30,000. M-Pesa accepted." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const counts = categoryCountMap(products);
  const featured = products.filter(p => p.featured);
  const newest = products.slice(0, 4);
  const onSale = products.filter(p => p.original_price);

  const [tab, setTab] = useState<string>("all");
  const tabs = [{ key: "all", label: "All" }, ...categories.slice(0, 4).map(c => ({ key: c.slug, label: c.name.split(" ")[0] }))];
  const filteredFeatured = tab === "all" ? featured : featured.filter(p => categories.find(c => c.id === p.category_id)?.slug === tab);
  const catName = (id: string | null) => categories.find(c => c.id === id)?.name;

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <HeroCarousel />

        {/* Category grid */}
        <Reveal as="section" className="container-x py-10 sm:py-14">
          <SectionTitle eyebrow="BROWSE" title="Shop by Category" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 60} variant="scale">
                <Link to="/shop" search={{ category: c.slug } as any} className="group relative aspect-square rounded-lg overflow-hidden bg-muted block">
                  <img src={c.icon_url ?? ""} alt={c.name} className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-cream">
                    <div className="font-display font-bold text-sm sm:text-base leading-tight">{c.name}</div>
                    <div className="text-[10px] text-cream/70 uppercase tracking-wider mt-0.5">{counts.get(c.id) ?? 0} products</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Featured */}
        <Reveal as="section" className="container-x py-10 sm:py-14">
          <SectionTitle eyebrow="HANDPICKED" title="Our Best Sellers" seeAll={{ to: "/shop" }} />
          <div className="flex flex-wrap gap-2 mb-5">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-full text-sm font-medium border ${tab === t.key ? "bg-espresso text-cream border-espresso" : "bg-card border-border hover:border-terracotta"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredFeatured.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard product={p} categoryName={catName(p.category_id)} />
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* New arrivals */}
        <section className="bg-card border-y border-border py-10 sm:py-14">
          <Reveal className="container-x">
            <SectionTitle eyebrow="JUST IN" title="New Arrivals" seeAll={{ to: "/shop" }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {newest.map((p, i) => (
                <Reveal key={p.id} delay={i * 80} variant="fade-up">
                  <ProductCard product={p} categoryName={catName(p.category_id)} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Sale */}
        {onSale.length > 0 && (
          <Reveal as="section" className="container-x py-10 sm:py-14">
            <SectionTitle eyebrow="SAVE BIG" title="Special Offers" seeAll={{ to: "/shop" }} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {onSale.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} categoryName={catName(p.category_id)} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* Per-category rows */}
        {categories.slice(0, 4).map(c => {
          const list = products.filter(p => p.category_id === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} className="container-x py-8">
              <SectionTitle title={c.name} seeAll={{ to: "/shop", search: { category: c.slug } }} />
              <div className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
                {list.map(p => (
                  <div key={p.id} className="w-44 sm:w-56 shrink-0">
                    <ProductCard product={p} categoryName={c.name} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Brand story */}
        <section className="bg-espresso text-cream py-14">
          <div className="container-x grid md:grid-cols-2 gap-10 items-center">
            <Reveal variant="slide-left">
              <div className="text-xs tracking-[0.3em] text-gold font-semibold">OUR STORY</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">Furniture Should Tell a Story</h2>
              <p className="mt-4 text-cream/80 leading-relaxed">
                For over 15 years, Mandela Heritage has crafted furniture that becomes part of Kenyan family life — built from sustainably sourced wood and finished by hand in our Mihango workshop.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3"><span className="text-gold">✓</span> 15+ years of craftsmanship</li>
                <li className="flex gap-3"><span className="text-gold">✓</span> Sustainably sourced Kenyan hardwoods</li>
                <li className="flex gap-3"><span className="text-gold">✓</span> Made-to-order options for any space</li>
              </ul>
              <Link to="/about" className="inline-block mt-6 text-gold font-semibold hover:underline">Read our story →</Link>
            </Reveal>
            <Reveal variant="slide-right" delay={150}>
              <img src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=1200" alt="Workshop" className="rounded-lg aspect-[4/3] object-cover" />
            </Reveal>
          </div>
        </section>

        {/* Services */}
        <Reveal as="section" className="container-x py-14">
          <SectionTitle eyebrow="SERVICES" title="Furnishing Services" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Full Home Furnishing", price: "from KSh 150,000", icon: Heart },
              { title: "Single Room Makeover", price: "from KSh 50,000", icon: Wrench },
              { title: "Office Furnishing", price: "Custom quote", icon: ShieldCheck },
              { title: "Delivery & Installation", price: "Free over KSh 30,000", icon: Truck },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 100} variant="fade-up">
                <div className="bg-card border border-border rounded-lg p-5 flex flex-col h-full">
                  <s.icon className="size-8 text-terracotta" />
                  <h3 className="font-display font-bold text-lg mt-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.price}</p>
                  <a href={whatsappUrl(`Hello, I'd like to enquire about: ${s.title}.`)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 bg-whatsapp text-white text-sm font-semibold py-2 rounded hover:bg-whatsapp/90">
                    <MessageCircle className="size-4" /> Enquire
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Trust strip */}
        <section className="bg-cream border-y border-border py-8">
          <div className="container-x grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { label: "Secure Shopping" },
              { label: "M-Pesa Accepted" },
              { label: "Free Delivery >KSh 30K" },
              { label: "Free Installation" },
              { label: "Trusted in Nairobi" },
            ].map(t => (
              <div key={t.label} className="text-xs sm:text-sm font-semibold text-espresso">{t.label}</div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <Reveal as="section" variant="scale" className="container-x py-14">
          <div className="bg-gradient-to-br from-terracotta to-gold rounded-2xl p-8 sm:p-12 text-center text-cream">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Get 10% off your first order</h2>
            <p className="mt-2 text-cream/90 text-sm">Join our list for new arrivals, offers, and showroom news.</p>
            <form className="mt-6 max-w-md mx-auto flex gap-2" onSubmit={e => { e.preventDefault(); }}>
              <input type="email" required placeholder="you@email.com" className="flex-1 px-4 py-3 rounded text-espresso outline-none bg-cream" />
              <button className="bg-espresso text-cream font-semibold px-5 rounded hover:bg-espresso/90">Subscribe</button>
            </form>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
