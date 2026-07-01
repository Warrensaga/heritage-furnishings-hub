import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Tags, ShoppingBag, Image, LogOut, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Mandela Heritage" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const ok = !!data.user;
      setAuthed(ok);
      setReady(true);
      if (!ok && pathname !== "/admin/login") navigate({ to: "/admin/login" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
      if (!session?.user && pathname !== "/admin/login") navigate({ to: "/admin/login" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [pathname, navigate]);

  if (pathname === "/admin/login") return <Outlet />;
  if (!ready) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!authed) return null;

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/variations", label: "Variations", icon: Layers },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/content", label: "Site Content", icon: Image },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <Link to="/" className="px-5 py-5 border-b border-slate-200">
          <div className="font-display font-bold text-espresso">MANDELA HERITAGE</div>
          <div className="text-[10px] tracking-[0.3em] text-terracotta">ADMIN</div>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to as any} className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium ${active ? "bg-terracotta text-white" : "hover:bg-slate-100 text-slate-700"}`}>
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }} className="m-3 flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-slate-100 text-slate-700">
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden bg-white border-b border-slate-200 p-3 flex gap-2 overflow-x-auto">
          {nav.map(n => (
            <Link key={n.to} to={n.to as any} className="text-xs whitespace-nowrap px-3 py-1.5 rounded bg-slate-100">{n.label}</Link>
          ))}
        </header>
        <main className="p-5 sm:p-8 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
