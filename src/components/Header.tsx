import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, MessageCircle, ChevronDown } from "lucide-react";
import { fetchCategories } from "@/lib/db";
import { useCart } from "@/lib/cart";
import { whatsappUrl, WHATSAPP_NUMBER } from "@/lib/format";
import logoAsset from "@/assets/mandela-logo.png.asset.json";

export function Header() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q || undefined } as any });
  };

  const navLink = "hover:text-terracotta whitespace-nowrap font-medium text-sm transition-colors";

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
      <div className="container-x">
        <div className="flex items-center gap-3 sm:gap-6 h-16 sm:h-20">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Mandela Heritage Furnitures — Home">
            <img src={logoAsset.url} alt="Mandela Heritage Furnitures logo" width={44} height={44} className="size-10 sm:size-12 rounded-full object-cover" />
            <span className="hidden sm:block font-display text-lg font-bold text-espresso leading-tight">
              MANDELA<span className="block text-[10px] tracking-[0.25em] text-terracotta font-sans font-semibold">HERITAGE</span>
            </span>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl items-stretch h-11 rounded-md border border-border bg-card overflow-hidden">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search furniture..." className="flex-1 px-4 text-sm outline-none bg-card" />
            <button type="submit" aria-label="Search" className="bg-terracotta text-primary-foreground px-4 hover:bg-terracotta/90 flex items-center justify-center">
              <Search className="size-4" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <a href={whatsappUrl(`Hello Mandela Heritage Furnitures, I'd like to enquire.`)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-muted text-forest" aria-label="WhatsApp">
              <MessageCircle className="size-5" />
            </a>
            <Link to="/cart" className="relative p-2 rounded-md hover:bg-muted" aria-label="Cart">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-primary-foreground text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={onSearch} className="md:hidden pb-3">
          <div className="flex items-stretch h-10 rounded-md border border-border bg-card overflow-hidden">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search furniture..." className="flex-1 px-3 text-sm outline-none bg-card" />
            <button type="submit" aria-label="Search" className="bg-terracotta text-primary-foreground px-4"><Search className="size-4" /></button>
          </div>
        </form>

        <nav className="hidden lg:flex justify-center items-center gap-8 h-11 text-sm">
          <Link to="/" className={navLink} activeOptions={{ exact: true }} activeProps={{ className: "text-terracotta" }}>Home</Link>
          <Link to="/shop" className={navLink} activeProps={{ className: "text-terracotta" }}>Shop</Link>

          <div className="relative" ref={dropRef}>
            <button
              type="button"
              onClick={() => setCatOpen(v => !v)}
              className={`${navLink} inline-flex items-center gap-1`}
              aria-expanded={catOpen}
              aria-haspopup="true"
            >
              Categories <ChevronDown className={`size-3.5 transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </button>
            {catOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-card border border-border rounded-md shadow-lg py-2 max-h-[70vh] overflow-y-auto z-50">
                {categories.length === 0 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">No categories yet</div>
                )}
                {categories.map(c => (
                  <Link
                    key={c.id}
                    to="/shop"
                    search={{ category: c.slug } as any}
                    onClick={() => setCatOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-muted hover:text-terracotta"
                  >
                    {c.name}
                  </Link>
                ))}
                <div className="border-t border-border mt-2 pt-2">
                  <Link to="/categories" onClick={() => setCatOpen(false)} className="block px-4 py-2 text-sm font-semibold text-terracotta hover:bg-muted">
                    View all categories →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/projects" className={navLink} activeProps={{ className: "text-terracotta" }}>Projects</Link>
          <Link to="/contact" className={navLink} activeProps={{ className: "text-terracotta" }}>Contact Us</Link>
        </nav>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-cream">
          <div className="container-x py-3 flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)} className="py-2 font-medium">Home</Link>
            <Link to="/shop" onClick={() => setOpen(false)} className="py-2 font-medium">Shop</Link>
            <button
              onClick={() => setMobileCatOpen(v => !v)}
              className="py-2 font-medium flex items-center justify-between w-full"
              aria-expanded={mobileCatOpen}
            >
              Categories <ChevronDown className={`size-4 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileCatOpen && (
              <div className="pl-4 border-l-2 border-terracotta/30 ml-1 flex flex-col max-h-64 overflow-y-auto">
                {categories.map(c => (
                  <Link key={c.id} to="/shop" search={{ category: c.slug } as any} onClick={() => setOpen(false)} className="py-1.5 text-sm">{c.name}</Link>
                ))}
                <Link to="/categories" onClick={() => setOpen(false)} className="py-1.5 text-sm font-semibold text-terracotta">View all categories →</Link>
              </div>
            )}
            <Link to="/projects" onClick={() => setOpen(false)} className="py-2 font-medium">Projects</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2 font-medium">Contact Us</Link>
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="py-2 text-forest font-medium border-t border-border mt-2 pt-3">Call / WhatsApp +{WHATSAPP_NUMBER}</a>
          </div>
        </div>
      )}
    </header>
  );
}
