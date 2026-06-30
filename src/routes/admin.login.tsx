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

type Mode = "signin" | "signup" | "forgot";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (m.includes("user already registered")) return "An account with this email already exists.";
  if (m.includes("rate limit")) return "Too many attempts — please wait a moment and try again.";
  if (m.includes("network")) return "Network error — check your connection and try again.";
  return message;
}

function LoginPage() {
  const navigate = useNavigate();
  const signUpFn = useServerFn(adminSignUp);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/admin" });
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (!inviteCode.trim()) throw new Error("Invite code is required.");
        await signUpFn({ data: { email, password, inviteCode: inviteCode.trim() } });
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        toast.success("Admin account created.");
        navigate({ to: "/admin" });
      } else {
        // forgot password
        if (!email) throw new Error("Enter the admin email address.");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) throw error;
        setInfo("If an account exists for that email, a reset link has been sent. Check your inbox (and spam).");
        toast.success("Reset email sent if the account exists.");
      }
    } catch (err: any) {
      const msg = friendlyAuthError(err?.message ?? "Something went wrong.");
      toast.error(msg);
      setInfo(null);
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

        {mode !== "forgot" && (
          <div className="flex bg-slate-100 rounded p-1 mb-5">
            <button type="button" onClick={() => { setMode("signin"); setInfo(null); }} className={`flex-1 text-xs font-semibold py-1.5 rounded ${mode === "signin" ? "bg-white shadow-sm text-espresso" : "text-slate-500"}`}>Sign in</button>
            <button type="button" onClick={() => { setMode("signup"); setInfo(null); }} className={`flex-1 text-xs font-semibold py-1.5 rounded ${mode === "signup" ? "bg-white shadow-sm text-espresso" : "text-slate-500"}`}>Sign up</button>
          </div>
        )}

        {mode === "forgot" && (
          <div className="mb-5 text-center">
            <h2 className="font-display text-lg font-semibold text-espresso">Reset password</h2>
            <p className="text-xs text-slate-500 mt-1">We'll email you a secure link to set a new password.</p>
          </div>
        )}

        <label className="block text-xs font-semibold text-slate-700">Email</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />

        {mode !== "forgot" && (
          <>
            <label className="block text-xs font-semibold text-slate-700 mt-4">Password</label>
            <input required type="password" minLength={mode === "signup" ? 8 : 6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
          </>
        )}

        {mode === "signup" && (
          <>
            <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>
            <label className="block text-xs font-semibold text-slate-700 mt-4">Invite code</label>
            <input required type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta font-mono" />
            <p className="mt-1 text-[11px] text-slate-500">Required. Ask the site owner for the invite code.</p>
          </>
        )}

        {mode === "signin" && (
          <div className="text-right mt-2">
            <button type="button" onClick={() => { setMode("forgot"); setInfo(null); }} className="text-[11px] text-terracotta hover:underline font-semibold">
              Forgot password?
            </button>
          </div>
        )}

        {info && (
          <div className="mt-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-3 py-2">
            {info}
          </div>
        )}

        <button disabled={loading} className="mt-6 w-full bg-terracotta text-white font-semibold py-2.5 rounded hover:bg-terracotta/90 disabled:opacity-50">
          {loading
            ? (mode === "signin" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending link...")
            : (mode === "signin" ? "Sign in" : mode === "signup" ? "Create admin account" : "Send reset link")}
        </button>

        {mode === "forgot" && (
          <button type="button" onClick={() => { setMode("signin"); setInfo(null); }} className="mt-3 w-full text-xs text-slate-600 hover:text-espresso">
            ← Back to sign in
          </button>
        )}
      </form>
    </div>
  );
}
