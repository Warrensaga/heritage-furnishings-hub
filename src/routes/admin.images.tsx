import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCcw, ExternalLink, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/images")({
  head: () => ({ meta: [{ title: "Image Health — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ImageHealth,
});

type Source = { url: string; where: string; label: string; link?: string };
type Result = Source & { status: "pending" | "ok" | "broken" | "slow"; ms?: number; w?: number; h?: number };

const SLOW_MS = 2500;

async function probe(url: string): Promise<{ ok: boolean; ms: number; w: number; h: number }> {
  return new Promise(resolve => {
    const started = performance.now();
    const img = new Image();
    const done = (ok: boolean) => {
      const ms = Math.round(performance.now() - started);
      resolve({ ok, ms, w: img.naturalWidth, h: img.naturalHeight });
    };
    const timeout = setTimeout(() => done(false), 15000);
    img.onload = () => { clearTimeout(timeout); done(true); };
    img.onerror = () => { clearTimeout(timeout); done(false); };
    img.src = url;
  });
}

async function collectSources(): Promise<Source[]> {
  const out: Source[] = [];
  const { data: products } = await supabase.from("products").select("id, name, slug, image_urls");
  (products ?? []).forEach((p: any) => {
    (p.image_urls ?? []).forEach((u: string, i: number) =>
      out.push({ url: u, where: "Product", label: `${p.name} #${i + 1}`, link: `/shop/${p.slug}` })
    );
  });
  const { data: variations } = await (supabase as any).from("product_variations").select("sku, product_id, image_urls, products(name, slug)");
  (variations ?? []).forEach((v: any) => {
    (v.image_urls ?? []).forEach((u: string, i: number) =>
      out.push({ url: u, where: "Variation", label: `${v.products?.name ?? "?"} · ${v.sku} #${i + 1}`, link: v.products?.slug ? `/shop/${v.products.slug}` : undefined })
    );
  });
  const { data: cats } = await supabase.from("categories").select("name, slug, icon_url");
  (cats ?? []).forEach((c: any) => {
    if (c.icon_url) out.push({ url: c.icon_url, where: "Category", label: c.name });
  });
  const { data: content } = await supabase.from("site_content").select("key, value");
  (content ?? []).forEach((c: any) => {
    const found: string[] = [];
    JSON.stringify(c.value ?? {}).replace(/https?:[^"\s]+\.(?:png|jpe?g|webp|gif|avif|svg)[^"\s]*/gi, m => { found.push(m); return m; });
    found.forEach((u, i) => out.push({ url: u, where: "Content", label: `${c.key} #${i + 1}` }));
  });
  return out;
}

function ImageHealth() {
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<"all" | "broken" | "slow">("all");

  const run = async () => {
    setRunning(true);
    const sources = await collectSources();
    setResults(sources.map(s => ({ ...s, status: "pending" })));
    const concurrency = 8;
    let idx = 0;
    const next = async () => {
      const i = idx++;
      if (i >= sources.length) return;
      const s = sources[i];
      const r = await probe(s.url);
      setResults(prev => {
        const copy = [...prev];
        copy[i] = { ...s, status: !r.ok ? "broken" : r.ms > SLOW_MS ? "slow" : "ok", ms: r.ms, w: r.w, h: r.h };
        return copy;
      });
      return next();
    };
    await Promise.all(Array.from({ length: concurrency }, next));
    setRunning(false);
  };

  useEffect(() => { run(); }, []);

  const counts = {
    total: results.length,
    ok: results.filter(r => r.status === "ok").length,
    broken: results.filter(r => r.status === "broken").length,
    slow: results.filter(r => r.status === "slow").length,
    pending: results.filter(r => r.status === "pending").length,
  };
  const shown = results.filter(r => filter === "all" ? true : r.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Image Health</h1>
          <p className="text-sm text-slate-500 mt-1">Scans every product, variation, category and content image and reports broken or slow-loading assets ({">"} {SLOW_MS} ms).</p>
        </div>
        <button onClick={run} disabled={running} className="bg-terracotta text-white px-4 py-2 rounded font-semibold inline-flex items-center gap-2 disabled:opacity-60">
          {running ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />} Re-scan
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <Card label="Total" value={counts.total} />
        <Card label="OK" value={counts.ok} tone="ok" onClick={() => setFilter("all")} />
        <Card label="Broken" value={counts.broken} tone="bad" onClick={() => setFilter("broken")} />
        <Card label={`Slow (>${SLOW_MS}ms)`} value={counts.slow} tone="warn" onClick={() => setFilter("slow")} />
      </div>

      <div className="mt-5 flex gap-2 text-xs">
        {(["all", "broken", "slow"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded border ${filter === f ? "bg-espresso text-white border-espresso" : "border-slate-300 hover:bg-slate-100"}`}>{f}</button>
        ))}
      </div>

      <div className="mt-3 bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2 w-20">Status</th>
              <th className="text-left px-3 py-2 w-20">Preview</th>
              <th className="text-left px-3 py-2">Where</th>
              <th className="text-left px-3 py-2">Item</th>
              <th className="text-left px-3 py-2">URL</th>
              <th className="text-right px-3 py-2">Time</th>
              <th className="text-right px-3 py-2">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((r, i) => (
              <tr key={i} className={r.status === "broken" ? "bg-red-50/50" : r.status === "slow" ? "bg-amber-50/50" : ""}>
                <td className="px-3 py-2">
                  {r.status === "pending" && <Loader2 className="size-4 animate-spin text-slate-400" />}
                  {r.status === "ok" && <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle2 className="size-4" /> OK</span>}
                  {r.status === "broken" && <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold"><XCircle className="size-4" /> Broken</span>}
                  {r.status === "slow" && <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold"><Clock className="size-4" /> Slow</span>}
                </td>
                <td className="px-3 py-2">
                  {r.status !== "broken" && r.url ? <img src={r.url} alt="" className="size-10 object-cover rounded border border-slate-200" loading="lazy" /> : <div className="size-10 rounded border border-dashed border-red-300 bg-red-50 grid place-items-center text-red-500"><XCircle className="size-4" /></div>}
                </td>
                <td className="px-3 py-2 text-slate-500">{r.where}</td>
                <td className="px-3 py-2">
                  {r.link ? <Link to={r.link} className="hover:underline">{r.label}</Link> : r.label}
                </td>
                <td className="px-3 py-2 max-w-[280px] truncate"><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-terracotta inline-flex items-center gap-1">{r.url} <ExternalLink className="size-3" /></a></td>
                <td className="px-3 py-2 text-right text-xs tabular-nums">{r.ms != null ? `${r.ms}ms` : "—"}</td>
                <td className="px-3 py-2 text-right text-xs tabular-nums">{r.w ? `${r.w}×${r.h}` : "—"}</td>
              </tr>
            ))}
            {shown.length === 0 && !running && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-500">No images match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, tone, onClick }: { label: string; value: number; tone?: "ok" | "bad" | "warn"; onClick?: () => void }) {
  const color = tone === "bad" ? "text-red-600" : tone === "warn" ? "text-amber-600" : tone === "ok" ? "text-emerald-600" : "text-slate-900";
  return (
    <button onClick={onClick} className="text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-terracotta transition">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className={`font-display text-3xl font-bold mt-1 ${color}`}>{value}</div>
    </button>
  );
}
