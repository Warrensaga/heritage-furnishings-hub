import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchVariationTypes, fetchVariationValues, type VariationType, type VariationValue } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/variations")({
  component: VariationsAdmin,
  head: () => ({ meta: [{ title: "Variations — Admin" }, { name: "robots", content: "noindex" }] }),
});

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function VariationsAdmin() {
  const qc = useQueryClient();
  const { data: types = [] } = useQuery({ queryKey: ["variation_types"], queryFn: fetchVariationTypes });
  const { data: values = [] } = useQuery({ queryKey: ["variation_values"], queryFn: fetchVariationValues });
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const activeType = types.find(t => t.id === selectedType) ?? types[0];
  const activeValues = values.filter(v => v.variation_type_id === activeType?.id);

  const addType = async () => {
    const name = prompt("Variation type name (e.g. Cushion Fill)");
    if (!name) return;
    const { error } = await (supabase as any).from("variation_types").insert({
      name, slug: slugify(name), display_order: types.length + 1,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["variation_types"] });
    toast.success("Added");
  };

  const deleteType = async (t: VariationType) => {
    if (!confirm(`Delete "${t.name}" and all its values?`)) return;
    const { error } = await (supabase as any).from("variation_types").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["variation_types"] });
    qc.invalidateQueries({ queryKey: ["variation_values"] });
  };

  const [newValue, setNewValue] = useState("");
  const [newSwatch, setNewSwatch] = useState("");
  const addValue = async () => {
    if (!activeType || !newValue.trim()) return;
    const { error } = await (supabase as any).from("variation_values").insert({
      variation_type_id: activeType.id,
      value: newValue.trim(),
      slug: slugify(newValue),
      swatch_hex: newSwatch || null,
      display_order: activeValues.length + 1,
    });
    if (error) return toast.error(error.message);
    setNewValue(""); setNewSwatch("");
    qc.invalidateQueries({ queryKey: ["variation_values"] });
  };

  const editValue = async (v: VariationValue) => {
    const value = prompt("New value name", v.value);
    if (!value) return;
    const swatch = prompt("Swatch hex (leave blank for none)", v.swatch_hex ?? "") ?? "";
    const { error } = await (supabase as any).from("variation_values")
      .update({ value, slug: slugify(value), swatch_hex: swatch || null })
      .eq("id", v.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["variation_values"] });
  };

  const deleteValue = async (v: VariationValue) => {
    if (!confirm(`Delete "${v.value}"?`)) return;
    const { error } = await (supabase as any).from("variation_values").delete().eq("id", v.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["variation_values"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl font-bold">Variations Catalog</h1>
        <button onClick={addType} className="bg-terracotta text-white px-4 py-2 rounded font-semibold inline-flex items-center gap-2">
          <Plus className="size-4" /> New Type
        </button>
      </div>
      <p className="text-sm text-slate-500 mt-1">Manage the catalog of variation types (Size, Color, etc.) and their reusable values. Assign them to products from the product editor.</p>

      <div className="grid md:grid-cols-[240px_1fr] gap-5 mt-6">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-3 py-2 text-xs uppercase text-slate-500 border-b border-slate-100">Types</div>
          <ul>
            {types.map(t => (
              <li key={t.id} className={`flex items-center justify-between px-3 py-2 text-sm border-b border-slate-50 ${activeType?.id === t.id ? "bg-terracotta/10" : ""}`}>
                <button onClick={() => setSelectedType(t.id)} className="text-left flex-1 font-medium">{t.name}</button>
                <button onClick={() => deleteType(t)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          {activeType ? (
            <>
              <h2 className="font-display text-xl font-bold">{activeType.name} — Values</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeValues.map(v => (
                  <div key={v.id} className="inline-flex items-center gap-2 bg-slate-100 rounded px-3 py-1.5 text-sm">
                    {v.swatch_hex && <span className="size-4 rounded-full border border-slate-300" style={{ background: v.swatch_hex }} />}
                    <span>{v.value}</span>
                    <button onClick={() => editValue(v)} className="text-slate-500 hover:text-slate-800"><Pencil className="size-3" /></button>
                    <button onClick={() => deleteValue(v)} className="text-red-600 hover:text-red-800"><Trash2 className="size-3" /></button>
                  </div>
                ))}
                {activeValues.length === 0 && <div className="text-sm text-slate-500">No values yet.</div>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2 items-end border-t border-slate-100 pt-4">
                <label className="flex-1 min-w-[180px]">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Add value</div>
                  <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder={activeType.slug === "size" ? "e.g. 6 Seater" : "New value"} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
                </label>
                {activeType.slug === "color" || activeType.slug === "cushion-color" ? (
                  <label>
                    <div className="text-xs font-semibold text-slate-700 mb-1">Swatch</div>
                    <input type="color" value={newSwatch || "#000000"} onChange={e => setNewSwatch(e.target.value)} className="h-[38px] w-14 border border-slate-300 rounded" />
                  </label>
                ) : null}
                <button onClick={addValue} className="bg-espresso text-white px-4 py-2 rounded text-sm font-semibold">Add</button>
              </div>
            </>
          ) : <div className="text-slate-500 text-sm">Create a variation type to get started.</div>}
        </div>
      </div>
    </div>
  );
}
