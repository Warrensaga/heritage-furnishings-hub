import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { adminSignUp } from "@/lib/admin-signup.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const signUpFn = useServerFn(adminSignUp);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/admin" });
      } else {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (!inviteCode.trim()) throw new Error("Invite code is required.");
        await signUpFn({ data: { email, password, inviteCode: inviteCode.trim() } });
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        toast.success("Admin account created.");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="font-display font-bold text-espresso text-xl">MANDELA HERITAGE</div>
          <div className="text-[10px] tracking-[0.3em] text-terracotta mt-1">ADMIN PORTAL</div>
        </div>

        <div className="flex bg-slate-100 rounded p-1 mb-5">
          <button type="button" onClick={() => setMode("signin")} className={`flex-1 text-xs font-semibold py-1.5 rounded ${mode === "signin" ? "bg-white shadow-sm text-espresso" : "text-slate-500"}`}>Sign in</button>
          <button type="button" onClick={() => setMode("signup")} className={`flex-1 text-xs font-semibold py-1.5 rounded ${mode === "signup" ? "bg-white shadow-sm text-espresso" : "text-slate-500"}`}>Sign up</button>
        </div>

        <label className="block text-xs font-semibold text-slate-700">Email</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
        <label className="block text-xs font-semibold text-slate-700 mt-4">Password</label>
        <input required type="password" minLength={mode === "signup" ? 8 : 6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
        {mode === "signup" && (
          <>
            <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>
            <label className="block text-xs font-semibold text-slate-700 mt-4">Invite code</label>
            <input required type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta font-mono" />
            <p className="mt-1 text-[11px] text-slate-500">Required. Ask the site owner for the invite code.</p>
          </>
        )}

        <button disabled={loading} className="mt-6 w-full bg-terracotta text-white font-semibold py-2.5 rounded hover:bg-terracotta/90 disabled:opacity-50">
          {loading ? (mode === "signin" ? "Signing in..." : "Creating account...") : (mode === "signin" ? "Sign in" : "Create admin account")}
        </button>
      </form>
    </div>
  );
}
