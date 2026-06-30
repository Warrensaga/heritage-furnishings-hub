import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchProducts, type Product } from "@/lib/db";
import { formatKES } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

const empty = {
  name: "", slug: "", category_id: "", price: 0, original_price: "" as number | "" | null,
  description: "", image_urls: "", stock_status: "in_stock" as Product["stock_status"],
  badge: "" as string, featured: false,
};

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<null | (Product | typeof empty & { id?: string })>(null);
  const [search, setSearch] = useState("");

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const catName = (id: string | null) => categories.find(c => c.id === id)?.name ?? "—";

  const openNew = () => setEditing({ ...empty });
  const openEdit = (p: Product) => setEditing({
    ...p,
    image_urls: p.image_urls.join(", ") as any,
    original_price: p.original_price ?? "",
    badge: p.badge ?? "",
    category_id: p.category_id ?? "",
  } as any);

  const save = async () => {
    if (!editing) return;
    const e: any = editing;
    const payload = {
      name: e.name,
      slug: e.slug || slugify(e.name),
      category_id: e.category_id || null,
      price: Number(e.price),
      original_price: e.original_price === "" || e.original_price === null ? null : Number(e.original_price),
      description: e.description || null,
      image_urls: (typeof e.image_urls === "string" ? e.image_urls.split(",").map((s: string) => s.trim()).filter(Boolean) : e.image_urls),
      stock_status: e.stock_status,
      badge: e.badge || null,
      featured: !!e.featured,
    };
    const { error } = e.id
      ? await supabase.from("products").update(payload).eq("id", e.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(e.id ? "Updated" : "Created");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <button onClick={openNew} className="bg-terracotta text-white px-4 py-2 rounded font-semibold inline-flex items-center gap-2"><Plus className="size-4" /> Add Product</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="mt-4 w-full max-w-sm border border-slate-300 rounded px-3 py-2 text-sm" />

      <div className="mt-5 bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Category</th><th className="text-left px-4 py-2">Price</th><th className="text-left px-4 py-2">Stock</th><th className="text-left px-4 py-2">Featured</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-slate-500">{catName(p.category_id)}</td>
                <td className="px-4 py-2">{formatKES(p.price)}</td>
                <td className="px-4 py-2 text-xs">{p.stock_status}</td>
                <td className="px-4 py-2">{p.featured ? "★" : ""}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4" onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-bold mb-4">{(editing as any).id ? "Edit Product" : "Add Product"}</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <L label="Name *"><input className="inp" value={(editing as any).name} onChange={e => setEditing({ ...(editing as any), name: e.target.value, slug: (editing as any).id ? (editing as any).slug : slugify(e.target.value) })} /></L>
              <L label="Slug"><input className="inp" value={(editing as any).slug} onChange={e => setEditing({ ...(editing as any), slug: e.target.value })} /></L>
              <L label="Category"><select className="inp" value={(editing as any).category_id} onChange={e => setEditing({ ...(editing as any), category_id: e.target.value })}><option value="">—</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></L>
              <L label="Price (KES) *"><input type="number" className="inp" value={(editing as any).price} onChange={e => setEditing({ ...(editing as any), price: Number(e.target.value) })} /></L>
              <L label="Original Price"><input type="number" className="inp" value={(editing as any).original_price ?? ""} onChange={e => setEditing({ ...(editing as any), original_price: e.target.value === "" ? "" : Number(e.target.value) })} /></L>
              <L label="Stock Status"><select className="inp" value={(editing as any).stock_status} onChange={e => setEditing({ ...(editing as any), stock_status: e.target.value })}><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option><option value="made_to_order">Made to order</option></select></L>
              <L label="Badge"><select className="inp" value={(editing as any).badge ?? ""} onChange={e => setEditing({ ...(editing as any), badge: e.target.value })}><option value="">—</option><option>BEST SELLER</option><option>NEW</option><option>SALE</option></select></L>
              <L label="Featured"><label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={!!(editing as any).featured} onChange={e => setEditing({ ...(editing as any), featured: e.target.checked })} /> Featured on homepage</label></L>
              <L label="Image URLs (comma separated)" full><textarea rows={2} className="inp" value={(editing as any).image_urls} onChange={e => setEditing({ ...(editing as any), image_urls: e.target.value })} /></L>
              <L label="Description" full><textarea rows={4} className="inp" value={(editing as any).description ?? ""} onChange={e => setEditing({ ...(editing as any), description: e.target.value })} /></L>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-slate-300 rounded text-sm">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-terracotta text-white rounded font-semibold text-sm">Save</button>
            </div>
            <style>{`.inp{width:100%;border:1px solid rgb(203 213 225);border-radius:6px;padding:8px 10px;outline:none} .inp:focus{border-color:var(--terracotta)}`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "sm:col-span-2" : ""}><div className="text-xs font-semibold text-slate-700 mb-1">{label}</div>{children}</label>;
}
