import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteContent, fetchProducts } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({ component: ContentAdmin, head: () => ({ meta: [{ name: "robots", content: "noindex" }] }) });

type Slide = { category: string; headline: string; subtext: string; image: string; cta_link: string };
type Testimonial = { name: string; role: string; quote: string };

const PAGE_KEYS = [
  { key: "page_about", label: "About page copy", rows: 8 },
  { key: "page_contact", label: "Contact page copy", rows: 6 },
  { key: "page_delivery", label: "Delivery page copy", rows: 6 },
  { key: "page_faq", label: "FAQ page copy", rows: 8 },
  { key: "page_projects_intro", label: "Projects page intro", rows: 4 },
  { key: "footer_tagline", label: "Footer tagline", rows: 2 },
] as const;

function ContentAdmin() {
  const qc = useQueryClient();
  const { data: slidesData } = useQuery({ queryKey: ["carousel_slides"], queryFn: () => fetchSiteContent("carousel_slides") });
  const { data: bannerText } = useQuery({ queryKey: ["promo_banner_text"], queryFn: () => fetchSiteContent("promo_banner_text") });
  const { data: bannerActive } = useQuery({ queryKey: ["promo_banner_active"], queryFn: () => fetchSiteContent("promo_banner_active") });
  const { data: featuredIds } = useQuery({ queryKey: ["featured_product_ids"], queryFn: () => fetchSiteContent("featured_product_ids") });
  const { data: testimonialsData } = useQuery({ queryKey: ["testimonials"], queryFn: () => fetchSiteContent("testimonials") });
  const pageQueries = PAGE_KEYS.map(p =>
    useQuery({ queryKey: [p.key], queryFn: () => fetchSiteContent(p.key) })
  );
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const [slides, setSlides] = useState<Slide[]>([]);
  const [banner, setBanner] = useState("");
  const [active, setActive] = useState(true);
  const [feat, setFeat] = useState<string[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pages, setPages] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => { if (Array.isArray(slidesData)) setSlides(slidesData); }, [slidesData]);
  useEffect(() => { if (typeof bannerText === "string") setBanner(bannerText); }, [bannerText]);
  useEffect(() => { if (typeof bannerActive === "boolean") setActive(bannerActive); }, [bannerActive]);
  useEffect(() => { if (Array.isArray(featuredIds)) setFeat(featuredIds); }, [featuredIds]);
  useEffect(() => { if (Array.isArray(testimonialsData)) setTestimonials(testimonialsData); }, [testimonialsData]);
  PAGE_KEYS.forEach((p, i) => {
    const val = pageQueries[i].data;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => { if (typeof val === "string") setPages(prev => ({ ...prev, [p.key]: val })); }, [val]);
  });

  const upsert = async (key: string, value: any) => {
    const { error } = await supabase.from("site_content").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  };

  const saveAll = async () => {
    try {
      await Promise.all([
        upsert("carousel_slides", slides),
        upsert("promo_banner_text", banner),
        upsert("promo_banner_active", active),
        upsert("featured_product_ids", feat),
        upsert("testimonials", testimonials),
        ...PAGE_KEYS.map(p => upsert(p.key, pages[p.key] ?? "")),
      ]);
      toast.success("Saved");
      qc.invalidateQueries();
    } catch (e: any) { toast.error(e.message); }
  };

  const updateSlide = (i: number, patch: Partial<Slide>) => setSlides(s => s.map((sl, idx) => idx === i ? { ...sl, ...patch } : sl));
  const addSlide = () => setSlides(s => [...s, { category: "NEW CATEGORY", headline: "", subtext: "", image: "", cta_link: "/shop" }]);
  const removeSlide = (i: number) => { if (!confirm("Remove this slide?")) return; setSlides(s => s.filter((_, idx) => idx !== i)); };

  const updateT = (i: number, patch: Partial<Testimonial>) => setTestimonials(s => s.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  const addT = () => setTestimonials(s => [...s, { name: "", role: "", quote: "" }]);
  const removeT = (i: number) => { if (!confirm("Remove this testimonial?")) return; setTestimonials(s => s.filter((_, idx) => idx !== i)); };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold">Site Content</h1>
        <button onClick={saveAll} className="bg-terracotta text-white px-5 py-2 rounded font-semibold">Save All</button>
      </div>

      <section className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-display font-bold text-lg">Promo Banner</h2>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Active</label>
        <textarea value={banner} onChange={e => setBanner(e.target.value)} rows={2} className="mt-3 w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </section>

      <section className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Hero Carousel Slides</h2>
          <button onClick={addSlide} className="text-sm font-semibold text-terracotta inline-flex items-center gap-1"><Plus className="size-4" /> Add slide</button>
        </div>
        <div className="mt-4 space-y-4">
          {slides.map((s, i) => (
            <div key={i} className="border border-slate-200 rounded p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <input className="inp" placeholder="Category (uppercase)" value={s.category} onChange={e => updateSlide(i, { category: e.target.value })} />
              <input className="inp" placeholder="Link e.g. /shop?category=sofas-seating" value={s.cta_link} onChange={e => updateSlide(i, { cta_link: e.target.value })} />
              <input className="inp sm:col-span-2" placeholder="Headline" value={s.headline} onChange={e => updateSlide(i, { headline: e.target.value })} />
              <input className="inp sm:col-span-2" placeholder="Subtext" value={s.subtext} onChange={e => updateSlide(i, { subtext: e.target.value })} />
              <input className="inp sm:col-span-2" placeholder="Image URL" value={s.image} onChange={e => updateSlide(i, { image: e.target.value })} />
              <button onClick={() => removeSlide(i)} className="text-red-600 text-xs inline-flex items-center gap-1 sm:col-span-2"><Trash2 className="size-3.5" /> Remove slide</button>
            </div>
          ))}
        </div>
        <style>{`.inp{border:1px solid rgb(203 213 225);border-radius:6px;padding:8px 10px;outline:none;width:100%} .inp:focus{border-color:var(--terracotta)}`}</style>
      </section>

      <section className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-display font-bold text-lg">Featured Products</h2>
        <p className="text-xs text-slate-500 mt-1">Tick products to highlight on the homepage best-sellers section (overrides the "featured" flag if any are selected).</p>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="mt-3 border border-slate-300 rounded px-3 py-2 text-sm w-full max-w-sm" />
        <div className="mt-3 max-h-72 overflow-y-auto border border-slate-200 rounded">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 last:border-0 text-sm">
              <input type="checkbox" checked={feat.includes(p.id)} onChange={e => setFeat(prev => e.target.checked ? [...prev, p.id] : prev.filter(x => x !== p.id))} />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
