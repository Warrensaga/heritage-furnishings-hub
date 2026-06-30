import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/lib/db";

type Search = { category?: string; q?: string; sort?: string; stock?: string; min?: number; max?: number; page?: number };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    stock: typeof s.stock === "string" ? s.stock : undefined,
    min: typeof s.min === "number" ? s.min : undefined,
    max: typeof s.max === "number" ? s.max : undefined,
    page: typeof s.page === "number" ? s.page : undefined,
  }),
  head: () => ({ meta: [{ title: "Shop — Mandela Heritage Furnitures" }, { name: "description", content: "Browse our complete catalogue of premium furniture." }] }),
  component: ShopPage,
});

const PAGE_SIZE = 12;

function ShopPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [maxPriceLocal, setMaxPriceLocal] = useState<number | undefined>(undefined);

  const catBySlug = (slug?: string) => categories.find(c => c.slug === slug);
  const selectedCat = catBySlug(search.category);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCat) list = list.filter(p => p.category_id === selectedCat.id);
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }
    if (search.stock && search.stock !== "all") list = list.filter(p => p.stock_status === search.stock);
    const max = maxPriceLocal ?? search.max;
    if (max) list = list.filter(p => p.price <= max);
    switch (search.sort) {
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "newest": list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
      case "featured": list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured)); break;
    }
    return list;
  }, [products, selectedCat, search.q, search.stock, search.sort, search.max, maxPriceLocal]);

  const page = search.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const catName = (id: string | null) => categories.find(c => c.id === id)?.name;

  const update = (patch: Partial<Search>) => nav({ search: (prev: any) => ({ ...prev, ...patch, page: undefined }) as any });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-x py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{selectedCat ? selectedCat.name : "All Furniture"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} products</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="bg-card border border-border rounded-lg p-5 h-fit lg:sticky lg:top-44">
            <div className="font-display font-bold text-sm uppercase tracking-wider mb-3">Categories</div>
            <ul className="space-y-1.5 text-sm">
              <li><button onClick={() => update({ category: undefined })} className={`hover:text-terracotta ${!search.category ? "text-terracotta font-semibold" : ""}`}>All</button></li>
              {categories.map(c => (
                <li key={c.id}>
                  <button onClick={() => update({ category: c.slug })} className={`hover:text-terracotta ${search.category === c.slug ? "text-terracotta font-semibold" : ""}`}>{c.name}</button>
                </li>
              ))}
            </ul>

            <div className="mt-6 font-display font-bold text-sm uppercase tracking-wider mb-3">Max Price</div>
            <input type="range" min={5000} max={300000} step={5000} value={maxPriceLocal ?? search.max ?? 300000}
              onChange={e => setMaxPriceLocal(Number(e.target.value))}
              onMouseUp={e => update({ max: Number((e.target as HTMLInputElement).value) })}
              onTouchEnd={e => update({ max: Number((e.target as HTMLInputElement).value) })}
              className="w-full accent-terracotta" />
            <div className="text-xs text-muted-foreground mt-1">Up to KSh {(maxPriceLocal ?? search.max ?? 300000).toLocaleString()}</div>

            <div className="mt-6 font-display font-bold text-sm uppercase tracking-wider mb-3">Stock</div>
            <select value={search.stock ?? "all"} onChange={e => update({ stock: e.target.value })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="in_stock">In stock</option>
              <option value="made_to_order">Made to order</option>
              <option value="out_of_stock">Out of stock</option>
            </select>

            <div className="mt-6 font-display font-bold text-sm uppercase tracking-wider mb-3">Sort</div>
            <select value={search.sort ?? "featured"} onChange={e => update({ sort: e.target.value })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </aside>

          {/* Grid */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : paged.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground">No products match these filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {paged.map(p => <ProductCard key={p.id} product={p} categoryName={catName(p.category_id)} />)}
              </div>
            )}

            {pageCount > 1 && (
              <div className="flex justify-center gap-1 mt-8">
                {Array.from({ length: pageCount }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <Link key={n} to="/shop" search={{ ...search, page: n } as any} className={`size-9 grid place-items-center rounded border ${n === page ? "bg-terracotta text-white border-terracotta" : "bg-card border-border hover:border-terracotta"}`}>{n}</Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
