import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, oos, newO, allO] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("stock_status", "out_of_stock"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      return { products: p.count ?? 0, oos: oos.count ?? 0, newOrders: newO.count ?? 0, totalOrders: allO.count ?? 0 };
    },
  });
  const { data: recent = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Products", value: stats?.products ?? "…" },
          { label: "Out of Stock", value: stats?.oos ?? "…" },
          { label: "New Orders", value: stats?.newOrders ?? "…" },
          { label: "Total Orders", value: stats?.totalOrders ?? "…" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-3xl font-display font-bold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-display font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-terracotta font-semibold">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-2">Order</th><th className="text-left px-4 py-2">Customer</th><th className="text-left px-4 py-2">Total</th><th className="text-left px-4 py-2">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No orders yet.</td></tr>}
            {recent.map((o: any) => (
              <tr key={o.id}>
                <td className="px-4 py-2 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-2">{o.customer_name}</td>
                <td className="px-4 py-2">{formatKES(o.total)}</td>
                <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">
        <Link to="/admin/products" className="bg-terracotta text-white font-semibold px-4 py-2 rounded text-sm">+ Add Product</Link>
        <Link to="/admin/content" className="bg-white border border-slate-300 px-4 py-2 rounded text-sm font-semibold">Edit Homepage</Link>
      </div>
    </div>
  );
}
