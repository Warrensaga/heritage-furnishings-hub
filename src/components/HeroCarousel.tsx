import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { fetchSiteContent, type CarouselSlide } from "@/lib/db";
import { whatsappUrl } from "@/lib/format";

const FALLBACK: CarouselSlide[] = [
  { category: "SOFAS & SEATING", headline: "Premium Comfort for Your Living Room", subtext: "At Discounted Price · Free Delivery Nairobi", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800", cta_link: "/shop?category=sofas-seating" },
];

export function HeroCarousel() {
  const { data } = useQuery({
    queryKey: ["carousel_slides"],
    queryFn: () => fetchSiteContent("carousel_slides"),
  });
  const slides: CarouselSlide[] = Array.isArray(data) && data.length ? data : FALLBACK;
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSel = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSel);
    onSel();
    const t = setInterval(() => embla.scrollNext(), 4000);
    return () => { clearInterval(t); embla.off("select", onSel); };
  }, [embla]);

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => {
            const ctaParts = s.cta_link.split("?");
            const linkBase = ctaParts[0];
            const params = new URLSearchParams(ctaParts[1] ?? "");
            const category = params.get("category") ?? undefined;
            return (
              <div key={i} className="relative flex-[0_0_100%] min-h-[420px] sm:min-h-[520px] lg:min-h-[600px]">
                <img src={s.image} alt={s.headline} className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent" />
                <div className="relative container-x h-full flex items-center min-h-[420px] sm:min-h-[520px] lg:min-h-[600px]">
                  <div className="max-w-xl text-cream py-10">
                    <div className="text-xs sm:text-sm tracking-[0.3em] text-gold font-semibold">{s.category}</div>
                    <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mt-3 leading-tight">{s.headline}</h1>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-cream/80">{s.subtext}</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Link to={linkBase as any} search={category ? ({ category } as any) : undefined} className="inline-flex items-center justify-center bg-terracotta text-primary-foreground font-semibold px-6 py-3 rounded hover:bg-terracotta/90">
                        Shop Now
                      </Link>
                      <a href={whatsappUrl(`Hello, I'm interested in your ${s.category.toLowerCase()} collection.`)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-semibold px-6 py-3 rounded hover:bg-whatsapp/90">
                        <MessageCircle className="size-4" /> Order on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => embla?.scrollPrev()} aria-label="Previous" className="hidden sm:grid place-items-center absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-cream/90 hover:bg-cream text-espresso">
        <ChevronLeft className="size-5" />
      </button>
      <button onClick={() => embla?.scrollNext()} aria-label="Next" className="hidden sm:grid place-items-center absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-cream/90 hover:bg-cream text-espresso">
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => embla?.scrollTo(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${selected === i ? "w-8 bg-gold" : "w-2 bg-cream/60"}`} />
        ))}
      </div>
    </section>
  );
}
