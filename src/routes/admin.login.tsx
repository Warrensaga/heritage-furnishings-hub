import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="font-display font-bold text-espresso text-xl">MANDELA HERITAGE</div>
          <div className="text-[10px] tracking-[0.3em] text-terracotta mt-1">ADMIN PORTAL</div>
        </div>
        <label className="block text-xs font-semibold text-slate-700">Email</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
        <label className="block text-xs font-semibold text-slate-700 mt-4">Password</label>
        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
        <button disabled={loading} className="mt-6 w-full bg-terracotta text-white font-semibold py-2.5 rounded hover:bg-terracotta/90 disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-4 text-xs text-slate-500 text-center">Create your admin account from the Cloud users panel.</p>
      </form>
    </div>
  );
}
