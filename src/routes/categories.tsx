import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchCategories, fetchProducts, categoryCountMap } from "@/lib/db";
import { SITE_URL } from "@/lib/social";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Furniture Categories — Mandela Heritage Furnitures" },
      { name: "description", content: "Browse every furniture category at Mandela Heritage — sofas, dining sets, beds, office, outdoor and more. Handcrafted in Nairobi." },
      { property: "og:title", content: "All Furniture Categories — Mandela Heritage" },
      { property: "og:description", content: "Browse every furniture category at Mandela Heritage — sofas, dining, bedroom, office and outdoor." },
      { property: "og:url", content: `${SITE_URL}/categories` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/categories` }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const counts = categoryCountMap(products);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-10 sm:py-14">
        <div className="max-w-2xl">
          <div className="text-xs tracking-[0.3em] text-terracotta font-semibold">BROWSE</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">All Categories</h1>
          <p className="mt-3 text-muted-foreground">Explore our full range of handcrafted furniture, organized by room and style.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mt-8">
          {categories.map(c => (
            <Link key={c.id} to="/shop" search={{ category: c.slug } as any} className="group relative aspect-square rounded-lg overflow-hidden bg-muted block">
              <img src={c.icon_url ?? ""} alt={c.name} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-cream">
                <div className="font-display font-bold text-sm sm:text-base leading-tight">{c.name}</div>
                <div className="text-[10px] text-cream/70 uppercase tracking-wider mt-0.5">{counts.get(c.id) ?? 0} products</div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="mt-8 text-center text-muted-foreground py-16">No categories yet.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
