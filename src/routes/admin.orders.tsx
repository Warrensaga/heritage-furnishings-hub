import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, ChevronRight, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatKES, whatsappUrl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin, head: () => ({ meta: [{ name: "robots", content: "noindex" }] }) });

const STATUSES = ["new", "contacted", "fulfilled", "cancelled"] as const;

function OrdersAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };
  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("orders").update({ notes }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Notes saved");
  };
  const removeOrder = async (id: string) => {
    if (!confirm("Permanently delete this order? This cannot be undone.")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Order deleted");
    setExpanded(null);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <div className="mt-4 flex gap-2 flex-wrap">
        {["all", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded text-sm capitalize ${filter === s ? "bg-terracotta text-white" : "bg-white border border-slate-200"}`}>{s}</button>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {orders.length === 0 && <div className="text-center text-slate-500 py-12 bg-white rounded-lg border border-slate-200">No orders.</div>}
        {orders.map((o: any) => {
          const isOpen = expanded === o.id;
          return (
            <div key={o.id} className="bg-white border border-slate-200 rounded-lg">
              <div onClick={() => setExpanded(isOpen ? null : o.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left cursor-pointer select-none">
                {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                <div className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</div>
                <div className="flex-1 truncate font-medium">{o.customer_name}</div>
                <div className="hidden sm:block text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString()}</div>
                <div className="font-semibold">{formatKES(o.total)}</div>
                <select value={o.status} onClick={e => e.stopPropagation()} onChange={e => updateStatus(o.id, e.target.value)} className="text-xs border border-slate-300 rounded px-2 py-1">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={e => { e.stopPropagation(); removeOrder(o.id); }}
                  className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                  aria-label="Delete order"
                  title="Delete order"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {isOpen && (
                <div className="border-t border-slate-200 p-4 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase font-semibold text-slate-500">Items</div>
                    <ul className="mt-2 divide-y divide-slate-100">
                      {(o.items as any[]).map((it, i) => (
                        <li key={i} className="py-1.5 flex justify-between gap-2"><span>{it.name} x{it.qty}</span><span>{formatKES(it.price * it.qty)}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-slate-500">Customer</div>
                    <div className="mt-2 space-y-1">
                      <div><strong>{o.customer_name}</strong></div>
                      <div>{o.phone}</div>
                      {o.email && <div>{o.email}</div>}
                      <div className="text-slate-600">{o.delivery_address}</div>
                    </div>
                    <a href={whatsappUrl(`Hello ${o.customer_name}, this is Mandela Heritage Furnitures regarding order #${o.id.slice(0,8).toUpperCase()}.`).replace("254701333358", o.phone.replace(/^0/, "254").replace(/\D/g, ""))} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 bg-whatsapp text-white text-sm font-semibold px-3 py-1.5 rounded">
                      <MessageCircle className="size-4" /> WhatsApp Customer
                    </a>
                    <div className="mt-4">
                      <div className="text-xs uppercase font-semibold text-slate-500">Notes</div>
                      <NotesEditor initial={o.notes ?? ""} onSave={notes => updateNotes(o.id, notes)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotesEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <div className="mt-2">
      <textarea value={v} onChange={e => setV(e.target.value)} rows={3} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      <button onClick={() => onSave(v)} className="mt-1 text-xs font-semibold text-terracotta">Save notes</button>
    </div>
  );
}
