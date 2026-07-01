import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, Pencil, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchProductVariations,
  fetchVariationTypes,
  fetchVariationValues,
  type ProductVariation,
  type VariationStockStatus,
} from "@/lib/db";
import { formatKES } from "@/lib/format";
import { toast } from "sonner";

type Draft = {
  id?: string;
  sku: string;
  price: number | "";
  original_price: number | "" | null;
  stock_status: VariationStockStatus;
  delivery_days: number | "" | null;
  weight_kg: number | "" | null;
  dimensions_l: number | "" | null;
  dimensions_w: number | "" | null;
  dimensions_h: number | "" | null;
  dimensions_unit: string;
  description: string;
  image_urls: string;
  attributes: Record<string, string>; // typeId -> valueId
  is_default: boolean;
};

const emptyDraft = (): Draft => ({
  sku: "", price: "", original_price: "", stock_status: "in_stock",
  delivery_days: "", weight_kg: "", dimensions_l: "", dimensions_w: "", dimensions_h: "",
  dimensions_unit: "cm", description: "", image_urls: "", attributes: {}, is_default: false,
});

export function ProductVariationsPanel({ productId, productName }: { productId: string; productName: string }) {
  const qc = useQueryClient();
  const { data: variations = [] } = useQuery({ queryKey: ["product_variations", productId], queryFn: () => fetchProductVariations(productId) });
  const { data: types = [] } = useQuery({ queryKey: ["variation_types"], queryFn: fetchVariationTypes });
  const { data: values = [] } = useQuery({ queryKey: ["variation_values"], queryFn: fetchVariationValues });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStock, setBulkStock] = useState<VariationStockStatus | "">("");
  const [bulkDelivery, setBulkDelivery] = useState<string>("");
  const [bulkPriceDelta, setBulkPriceDelta] = useState<string>("");

  const valuesByType = (typeId: string) => values.filter(v => v.variation_type_id === typeId);

  const typeName = (id: string) => types.find(t => t.id === id)?.name ?? "";
  const valueName = (id: string) => values.find(v => v.id === id)?.value ?? "";

  const attributesToLabel = (attrs: Record<string, string>) =>
    Object.entries(attrs).map(([tid, vid]) => `${typeName(tid)}: ${valueName(vid)}`).join(", ");

  const openNew = () => setDraft(emptyDraft());
  const openEdit = (v: ProductVariation) => {
    // Convert stored { "Size": "6 Seater" } (by name) back to { typeId: valueId }
    const attrs: Record<string, string> = {};
    for (const [tname, vname] of Object.entries(v.attributes || {})) {
      const t = types.find(x => x.name === tname);
      if (!t) continue;
      const val = values.find(x => x.variation_type_id === t.id && x.value === vname);
      if (val) attrs[t.id] = val.id;
    }
    setDraft({
      id: v.id, sku: v.sku, price: v.price, original_price: v.original_price ?? "",
      stock_status: v.stock_status, delivery_days: v.delivery_days ?? "",
      weight_kg: v.weight_kg ?? "",
      dimensions_l: v.dimensions?.length ?? "", dimensions_w: v.dimensions?.width ?? "", dimensions_h: v.dimensions?.height ?? "",
      dimensions_unit: v.dimensions?.unit ?? "cm",
      description: v.description ?? "", image_urls: v.image_urls.join(", "),
      attributes: attrs, is_default: v.is_default,
    });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.sku.trim()) return toast.error("SKU required");
    if (draft.price === "" || Number(draft.price) < 0) return toast.error("Price required");
    // attributes as name->name for readability + storage
    const attrsByName: Record<string, string> = {};
    for (const [tid, vid] of Object.entries(draft.attributes)) {
      attrsByName[typeName(tid)] = valueName(vid);
    }
    const payload: any = {
      product_id: productId,
      sku: draft.sku.trim(),
      price: Number(draft.price),
      original_price: draft.original_price === "" || draft.original_price == null ? null : Number(draft.original_price),
      stock_status: draft.stock_status,
      delivery_days: draft.delivery_days === "" || draft.delivery_days == null ? null : Number(draft.delivery_days),
      weight_kg: draft.weight_kg === "" || draft.weight_kg == null ? null : Number(draft.weight_kg),
      dimensions: (draft.dimensions_l || draft.dimensions_w || draft.dimensions_h)
        ? { length: Number(draft.dimensions_l) || null, width: Number(draft.dimensions_w) || null, height: Number(draft.dimensions_h) || null, unit: draft.dimensions_unit }
        : null,
      description: draft.description || null,
      image_urls: draft.image_urls.split(",").map(s => s.trim()).filter(Boolean),
      attributes: attrsByName,
      is_default: draft.is_default,
      display_order: variations.length + 1,
    };

    // If setting default, unset others
    if (draft.is_default) {
      await (supabase as any).from("product_variations").update({ is_default: false }).eq("product_id", productId);
    }

    const { error } = draft.id
      ? await (supabase as any).from("product_variations").update(payload).eq("id", draft.id)
      : await (supabase as any).from("product_variations").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(draft.id ? "Updated" : "Created");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["product_variations", productId] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this variation?")) return;
    const { error } = await (supabase as any).from("product_variations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["product_variations", productId] });
  };

  const duplicate = async (v: ProductVariation) => {
    const { id: _id, ...rest } = v as any;
    rest.sku = `${v.sku}-COPY`;
    rest.is_default = false;
    rest.display_order = variations.length + 1;
    const { error } = await (supabase as any).from("product_variations").insert(rest);
    if (error) return toast.error(error.message);
    toast.success("Duplicated");
    qc.invalidateQueries({ queryKey: ["product_variations", productId] });
  };

  const toggleSel = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const applyBulk = async () => {
    if (selected.size === 0) return toast.error("Select variations first");
    const updates: any = {};
    if (bulkStock) updates.stock_status = bulkStock;
    if (bulkDelivery !== "") updates.delivery_days = Number(bulkDelivery);
    if (Object.keys(updates).length) {
      const { error } = await (supabase as any).from("product_variations").update(updates).in("id", Array.from(selected));
      if (error) return toast.error(error.message);
    }
    if (bulkPriceDelta) {
      const delta = Number(bulkPriceDelta);
      for (const id of selected) {
        const v = variations.find(x => x.id === id);
        if (!v) continue;
        await (supabase as any).from("product_variations").update({ price: Math.max(0, v.price + delta) }).eq("id", id);
      }
    }
    toast.success("Bulk update applied");
    setSelected(new Set()); setBulkStock(""); setBulkDelivery(""); setBulkPriceDelta("");
    qc.invalidateQueries({ queryKey: ["product_variations", productId] });
  };

  return (
    <div className="border-t border-slate-200 pt-5 mt-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Variations <span className="text-sm font-normal text-slate-500">({variations.length})</span></h3>
        <button onClick={openNew} className="bg-espresso text-white px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5">
          <Plus className="size-3.5" /> Add Variation
        </button>
      </div>

      {variations.length > 0 && (
        <>
          <div className="mt-3 border border-slate-200 rounded overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-2 py-2"><input type="checkbox" checked={selected.size === variations.length} onChange={e => setSelected(e.target.checked ? new Set(variations.map(v => v.id)) : new Set())} /></th>
                  <th className="text-left px-2 py-2">Attributes</th>
                  <th className="text-left px-2 py-2">SKU</th>
                  <th className="text-left px-2 py-2">Price</th>
                  <th className="text-left px-2 py-2">Stock</th>
                  <th className="text-left px-2 py-2">Delivery</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variations.map(v => (
                  <tr key={v.id} className={v.is_default ? "bg-terracotta/5" : ""}>
                    <td className="px-2 py-2"><input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSel(v.id)} /></td>
                    <td className="px-2 py-2">{Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(" / ") || "—"} {v.is_default && <span className="ml-1 text-terracotta font-semibold">★</span>}</td>
                    <td className="px-2 py-2 font-mono">{v.sku}</td>
                    <td className="px-2 py-2">{formatKES(v.price)}</td>
                    <td className="px-2 py-2">{v.stock_status}</td>
                    <td className="px-2 py-2">{v.delivery_days != null ? `${v.delivery_days}d` : "—"}</td>
                    <td className="px-2 py-2 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(v)} className="p-1 hover:bg-slate-100 rounded"><Pencil className="size-3.5" /></button>
                      <button onClick={() => duplicate(v)} className="p-1 hover:bg-slate-100 rounded"><Copy className="size-3.5" /></button>
                      <button onClick={() => remove(v.id)} className="p-1 hover:bg-red-50 text-red-600 rounded"><Trash2 className="size-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-2 bg-slate-50 border border-slate-200 rounded p-3 text-xs">
            <div className="font-semibold self-center mr-2">Bulk edit ({selected.size}):</div>
            <label>
              <div className="text-[10px] uppercase text-slate-500">Stock</div>
              <select value={bulkStock} onChange={e => setBulkStock(e.target.value as any)} className="border border-slate-300 rounded px-2 py-1">
                <option value="">—</option>
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="made_to_order">Made to order</option>
                <option value="low_stock">Low stock</option>
              </select>
            </label>
            <label>
              <div className="text-[10px] uppercase text-slate-500">Delivery (days)</div>
              <input type="number" value={bulkDelivery} onChange={e => setBulkDelivery(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-24" />
            </label>
            <label>
              <div className="text-[10px] uppercase text-slate-500">Price delta (KES)</div>
              <input type="number" value={bulkPriceDelta} onChange={e => setBulkPriceDelta(e.target.value)} placeholder="+/- 1000" className="border border-slate-300 rounded px-2 py-1 w-28" />
            </label>
            <button onClick={applyBulk} className="bg-espresso text-white px-3 py-1.5 rounded font-semibold">Apply</button>
          </div>
        </>
      )}

      {draft && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-[60] p-4" onClick={() => setDraft(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">{draft.id ? "Edit Variation" : "New Variation"} — {productName}</h2>
              <button onClick={() => setDraft(null)}><X className="size-5" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-slate-700 mb-2">Attributes</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {types.map(t => {
                    const opts = valuesByType(t.id);
                    if (opts.length === 0) return null;
                    return (
                      <label key={t.id} className="flex items-center gap-2">
                        <div className="w-32 text-xs text-slate-600">{t.name}</div>
                        <select
                          className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm"
                          value={draft.attributes[t.id] ?? ""}
                          onChange={e => setDraft({ ...draft, attributes: { ...draft.attributes, [t.id]: e.target.value } })}
                        >
                          <option value="">—</option>
                          {opts.map(o => <option key={o.id} value={o.id}>{o.value}</option>)}
                        </select>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Add more types &amp; values in the Variations catalog.</p>
              </div>

              <F label="SKU *"><input className="inp" value={draft.sku} onChange={e => setDraft({ ...draft, sku: e.target.value })} /></F>
              <F label="Price (KES) *"><input type="number" className="inp" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value === "" ? "" : Number(e.target.value) })} /></F>
              <F label="Original Price"><input type="number" className="inp" value={draft.original_price ?? ""} onChange={e => setDraft({ ...draft, original_price: e.target.value === "" ? "" : Number(e.target.value) })} /></F>
              <F label="Stock Status">
                <select className="inp" value={draft.stock_status} onChange={e => setDraft({ ...draft, stock_status: e.target.value as any })}>
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="made_to_order">Made to order</option>
                  <option value="low_stock">Low stock</option>
                </select>
              </F>
              <F label="Delivery (days)"><input type="number" className="inp" value={draft.delivery_days ?? ""} onChange={e => setDraft({ ...draft, delivery_days: e.target.value === "" ? "" : Number(e.target.value) })} /></F>
              <F label="Weight (kg)"><input type="number" step="0.01" className="inp" value={draft.weight_kg ?? ""} onChange={e => setDraft({ ...draft, weight_kg: e.target.value === "" ? "" : Number(e.target.value) })} /></F>
              <F label="Dimensions L × W × H">
                <div className="flex gap-1">
                  <input type="number" className="inp" placeholder="L" value={draft.dimensions_l ?? ""} onChange={e => setDraft({ ...draft, dimensions_l: e.target.value === "" ? "" : Number(e.target.value) })} />
                  <input type="number" className="inp" placeholder="W" value={draft.dimensions_w ?? ""} onChange={e => setDraft({ ...draft, dimensions_w: e.target.value === "" ? "" : Number(e.target.value) })} />
                  <input type="number" className="inp" placeholder="H" value={draft.dimensions_h ?? ""} onChange={e => setDraft({ ...draft, dimensions_h: e.target.value === "" ? "" : Number(e.target.value) })} />
                  <select className="inp w-20" value={draft.dimensions_unit} onChange={e => setDraft({ ...draft, dimensions_unit: e.target.value })}>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </F>
              <F label="Default variation">
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={draft.is_default} onChange={e => setDraft({ ...draft, is_default: e.target.checked })} />
                  Show this variation first
                </label>
              </F>
              <F label="Image URLs (comma separated)" full>
                <textarea rows={2} className="inp" value={draft.image_urls} onChange={e => setDraft({ ...draft, image_urls: e.target.value })} />
              </F>
              <F label="Description override (optional)" full>
                <textarea rows={3} className="inp" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
              </F>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className="px-4 py-2 border border-slate-300 rounded text-sm">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-terracotta text-white rounded font-semibold text-sm inline-flex items-center gap-1.5"><Check className="size-4" /> Save</button>
            </div>
            <style>{`.inp{width:100%;border:1px solid rgb(203 213 225);border-radius:6px;padding:6px 10px;outline:none;font-size:13px} .inp:focus{border-color:var(--terracotta)}`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "sm:col-span-2" : ""}><div className="text-xs font-semibold text-slate-700 mb-1">{label}</div>{children}</label>;
}
