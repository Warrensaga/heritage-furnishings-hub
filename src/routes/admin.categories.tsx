import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchProducts, type Category } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesAdmin });

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"); }

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [editing, setEditing] = useState<null | Partial<Category>>(null);

  const count = (id: string) => products.filter(p => p.category_id === id).length;

  const save = async () => {
    if (!editing?.name) { toast.error("Name required"); return; }
    const payload = { name: editing.name, slug: editing.slug || slugify(editing.name), icon_url: editing.icon_url || null, display_order: editing.display_order ?? 0 };
    const { error } = editing.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const remove = async (c: Category) => {
    const n = count(c.id);
    if (n > 0 && !confirm(`${n} products are in this category. Delete anyway?`)) return;
    if (n === 0 && !confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
        <button onClick={() => setEditing({})} className="bg-terracotta text-white px-4 py-2 rounded font-semibold inline-flex items-center gap-2"><Plus className="size-4" /> New Category</button>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600"><tr><th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Slug</th><th className="text-left px-4 py-2">Order</th><th className="text-left px-4 py-2">Products</th><th></th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-slate-500">{c.slug}</td>
                <td className="px-4 py-2">{c.display_order}</td>
                <td className="px-4 py-2">{count(c.id)}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => setEditing(c)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(c)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4" onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="font-display font-bold text-xl mb-4">{editing.id ? "Edit Category" : "New Category"}</h2>
            <div className="space-y-3 text-sm">
              <label className="block"><div className="text-xs font-semibold mb-1">Name *</div><input className="w-full border border-slate-300 rounded px-3 py-2" value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} /></label>
              <label className="block"><div className="text-xs font-semibold mb-1">Slug</div><input className="w-full border border-slate-300 rounded px-3 py-2" value={editing.slug ?? ""} onChange={e => setEditing({ ...editing, slug: e.target.value })} /></label>
              <label className="block"><div className="text-xs font-semibold mb-1">Icon URL</div><input className="w-full border border-slate-300 rounded px-3 py-2" value={editing.icon_url ?? ""} onChange={e => setEditing({ ...editing, icon_url: e.target.value })} /></label>
              <label className="block"><div className="text-xs font-semibold mb-1">Display Order</div><input type="number" className="w-full border border-slate-300 rounded px-3 py-2" value={editing.display_order ?? 0} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-slate-300 rounded text-sm">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-terracotta text-white rounded font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
