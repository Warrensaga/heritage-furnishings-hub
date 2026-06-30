import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle, Mail, MapPin } from "lucide-react";
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/format";

export function Footer() {
  return (
    <footer className="bg-espresso text-cream/90 mt-16">
      <div className="container-x py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-bold text-cream">MANDELA HERITAGE</div>
          <div className="text-xs tracking-[0.3em] text-gold mt-1">FURNITURES</div>
          <p className="mt-4 text-sm text-cream/70 leading-relaxed">
            Premium handcrafted furniture from our showroom on the Eastern Bypass — built to last, priced for Kenyans.
          </p>
          <div className="flex gap-3 mt-5">
            <a href={whatsappUrl("Hello!")} target="_blank" rel="noreferrer" className="size-9 rounded-full bg-cream/10 hover:bg-cream/20 grid place-items-center"><MessageCircle className="size-4" /></a>
            <a href="#" className="size-9 rounded-full bg-cream/10 hover:bg-cream/20 grid place-items-center"><Facebook className="size-4" /></a>
            <a href="#" className="size-9 rounded-full bg-cream/10 hover:bg-cream/20 grid place-items-center"><Instagram className="size-4" /></a>
          </div>
        </div>

        <div>
          <div className="font-display text-sm font-bold uppercase tracking-wider text-gold mb-4">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" search={{ category: "sofas-seating" } as any} className="hover:text-gold">Sofas & Seating</Link></li>
            <li><Link to="/shop" search={{ category: "dining-sets" } as any} className="hover:text-gold">Dining Sets</Link></li>
            <li><Link to="/shop" search={{ category: "bedroom-furniture" } as any} className="hover:text-gold">Bedroom</Link></li>
            <li><Link to="/shop" search={{ category: "office-furniture" } as any} className="hover:text-gold">Office</Link></li>
            <li><Link to="/shop" search={{ category: "outdoor-furniture" } as any} className="hover:text-gold">Outdoor</Link></li>
            <li><Link to="/shop" className="hover:text-gold">All Products</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-display text-sm font-bold uppercase tracking-wider text-gold mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
            <li><Link to="/delivery" className="hover:text-gold">Delivery Info</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-display text-sm font-bold uppercase tracking-wider text-gold mb-4">Visit Us</div>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="flex gap-2"><MapPin className="size-4 mt-0.5 shrink-0 text-gold" /><span>{BUSINESS_ADDRESS}</span></li>
            <li className="flex gap-2"><MessageCircle className="size-4 mt-0.5 shrink-0 text-gold" /><a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-gold">+{WHATSAPP_NUMBER}</a></li>
            <li className="flex gap-2"><Mail className="size-4 mt-0.5 shrink-0 text-gold" /><a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-gold break-all">{BUSINESS_EMAIL}</a></li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[10px] px-2 py-1 rounded bg-cream/10 border border-cream/15">M-PESA</span>
            <span className="text-[10px] px-2 py-1 rounded bg-cream/10 border border-cream/15">FREE DELIVERY</span>
            <span className="text-[10px] px-2 py-1 rounded bg-cream/10 border border-cream/15">FREE INSTALL</span>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x py-4 text-xs text-cream/60 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div>© {new Date().getFullYear()} Mandela Heritage Furnitures. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Made with care in Nairobi.</span>
            <Link to="/admin/login" className="text-cream/40 hover:text-gold">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
