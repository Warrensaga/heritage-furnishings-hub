import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import logoAsset from "@/assets/mandela-logo.png.asset.json";
import { SITE_URL } from "@/lib/social";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-espresso">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-terracotta px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-terracotta/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or go home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-terracotta px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-terracotta/90">Try again</button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mandela Heritage Furnitures — Premium Furniture Showroom, Nairobi" },
      { name: "description", content: "Handcrafted sofas, dining sets, beds, office and outdoor furniture. Free delivery in Nairobi. Eastern Bypass, Mihango." },
      { property: "og:title", content: "Mandela Heritage Furnitures" },
      { property: "og:description", content: "Premium furniture showroom on Eastern Bypass, Nairobi." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Mandela Heritage Furnitures" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#3b2a1a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: logoAsset.url },
      { rel: "apple-touch-icon", href: logoAsset.url },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://images.unsplash.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Lato:wght@300;400;700;900&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FurnitureStore",
          name: "Mandela Heritage Furnitures",
          url: SITE_URL,
          logo: logoAsset.url,
          image: logoAsset.url,
          description: "Premium handcrafted furniture showroom on Eastern Bypass, Nairobi.",
          telephone: "+254701333358",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Eastern Bypass, Mihango",
            addressLocality: "Nairobi",
            addressCountry: "KE",
          },
          openingHours: ["Mo-Sa 08:00-18:00", "Su 10:00-16:00"],
          sameAs: [
            "https://www.instagram.com/mandela_heritagefurniture/",
            "https://www.facebook.com/profile.php?id=100071032794768",
            "https://www.tiktok.com/@mandela_h_furnitures",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <WhatsAppFloat />
        <Toaster position="top-center" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}
