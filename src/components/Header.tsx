import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShoppingCart, Menu, X, MessageCircle } from "lucide-react";
import { fetchCategories } from "@/lib/db";
import { useCart } from "@/lib/cart";
import { whatsappUrl, WHATSAPP_NUMBER } from "@/lib/format";

export function Header() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q || undefined, category: cat || undefined } as any });
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
      <div className="container-x">
        <div className="flex items-center gap-3 sm:gap-6 h-16 sm:h-20">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link to="/" className="font-display text-lg sm:text-2xl font-bold tracking-tight text-espresso leading-none">
            <span className="block">MANDELA</span>
            <span className="block text-[10px] sm:text-xs tracking-[0.3em] text-terracotta font-sans font-semibold">HERITAGE</span>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-2xl items-stretch h-11 rounded-md border border-border bg-card overflow-hidden">
            <select value={cat} onChange={e => setCat(e.target.value)} className="bg-muted text-sm px-3 border-r border-border outline-none">
              <option value="">All</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search furniture..." className="flex-1 px-4 text-sm outline-none bg-card" />
            <button type="submit" className="bg-terracotta text-primary-foreground px-4 hover:bg-terracotta/90 flex items-center justify-center">
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
            <button type="submit" className="bg-terracotta text-primary-foreground px-4"><Search className="size-4" /></button>
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-6 h-11 text-sm font-medium overflow-x-auto no-scrollbar">
          <Link to="/shop" className="hover:text-terracotta whitespace-nowrap">All Products</Link>
          {categories.map(c => (
            <Link key={c.id} to="/shop" search={{ category: c.slug } as any} className="hover:text-terracotta whitespace-nowrap">{c.name}</Link>
          ))}
        </nav>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-cream">
          <div className="container-x py-3 flex flex-col gap-1">
            <Link to="/shop" onClick={() => setOpen(false)} className="py-2 font-medium">All Products</Link>
            {categories.map(c => (
              <Link key={c.id} to="/shop" search={{ category: c.slug } as any} onClick={() => setOpen(false)} className="py-2">{c.name}</Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="py-2">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2">Contact</Link>
            <Link to="/faq" onClick={() => setOpen(false)} className="py-2">FAQ</Link>
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="py-2 text-forest font-medium">Call / WhatsApp +{WHATSAPP_NUMBER}</a>
          </div>
        </div>
      )}
    </header>
  );
}
