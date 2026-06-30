import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent } from "@/lib/db";

const DEFAULT = "Free Delivery on Orders Over KSh 30,000 · M-Pesa Accepted · Free Installation · Reply Within 1 Hour · Eastern Bypass, Nairobi";

export function AnnouncementBar() {
  const { data: text } = useQuery({
    queryKey: ["promo_banner_text"],
    queryFn: () => fetchSiteContent("promo_banner_text"),
  });
  const { data: active } = useQuery({
    queryKey: ["promo_banner_active"],
    queryFn: () => fetchSiteContent("promo_banner_active"),
  });
  if (active === false) return null;
  const message = typeof text === "string" ? text : DEFAULT;
  return (
    <div className="bg-espresso text-cream text-xs sm:text-sm overflow-hidden border-b border-espresso">
      <div className="flex whitespace-nowrap animate-ticker py-2">
        <span className="px-8">{message}</span>
        <span className="px-8" aria-hidden>{message}</span>
        <span className="px-8" aria-hidden>{message}</span>
      </div>
    </div>
  );
}
