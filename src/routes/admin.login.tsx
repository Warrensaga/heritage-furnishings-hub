import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminSignUp } from "@/lib/admin-signup.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot";
const REMEMBERED_EMAIL_KEY = "mhf.admin.email";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts — please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch")) return "Network error — check your connection and try again.";
  if (m.includes("password")) return message;
  return message;
}

function LoginPage() {
  const navigate = useNavigate();
  const signUpFn = useServerFn(adminSignUp);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [info, setInfo] = useState<string | null>(null);

  // Auto-redirect if already signed in; prefill remembered email
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {}
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate({ to: "/admin" });
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        try {
          if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
          else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        } catch {}
        toast.success("Welcome back!");
        navigate({ to: "/admin" });
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const result = await signUpFn({ data: { email: email.trim(), password, inviteCode: inviteCode.trim() } });
        if (!result.ok) throw new Error(result.error);
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInErr) throw signInErr;
        try { localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim()); } catch {}
        toast.success("Admin account created.");
        navigate({ to: "/admin" });
      } else {
        if (!email) throw new Error("Enter the admin email address.");
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) throw error;
        setInfo("If an account exists for that email, a reset link has been sent. Check your inbox (and spam folder).");
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

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <Link to="/" className="font-display font-bold text-espresso text-xl">MANDELA HERITAGE</Link>
          <div className="text-[10px] tracking-[0.3em] text-terracotta mt-1">ADMIN PORTAL</div>
        </div>

        <h1 className="font-display text-lg font-semibold text-espresso text-center mb-1">
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create admin account" : "Reset password"}
        </h1>
        <p className="text-xs text-slate-500 text-center mb-5">
          {mode === "signin" && "Welcome back. Sign in to manage products and orders."}
          {mode === "signup" && "Use your admin allowlist email or your invite code."}
          {mode === "forgot" && "We'll email you a secure link to set a new password."}
        </p>

        <label className="block text-xs font-semibold text-slate-700">Email</label>
        <input
          required type="email" autoComplete="email" autoFocus
          value={email} onChange={e => setEmail(e.target.value)}
          className="mt-1 w-full border border-slate-300 rounded px-3 py-2.5 text-sm outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
        />

        {mode !== "forgot" && (
          <>
            <label className="block text-xs font-semibold text-slate-700 mt-4">Password</label>
            <div className="relative mt-1">
              <input
                required type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : 6}
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded pl-3 pr-10 py-2.5 text-sm outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </>
        )}

        {mode === "signup" && (
          <>
            <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>
            <label className="block text-xs font-semibold text-slate-700 mt-4">Invite code <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2.5 text-sm outline-none focus:border-terracotta font-mono" />
            <p className="mt-1 text-[11px] text-slate-500">Leave blank if your email is allowlisted; otherwise enter the invite code.</p>
          </>
        )}

        {mode === "signin" && (
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="size-3.5 accent-terracotta" />
              Remember email
            </label>
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

        <button disabled={loading} className="mt-5 w-full bg-terracotta text-white font-semibold py-2.5 rounded hover:bg-terracotta/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading
            ? (mode === "signin" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending link...")
            : (mode === "signin" ? "Sign in" : mode === "signup" ? "Create admin account" : "Send reset link")}
        </button>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          {mode === "signin" && (
            <>New admin? <button type="button" onClick={() => { setMode("signup"); setInfo(null); }} className="text-terracotta font-semibold hover:underline">Create an account</button></>
          )}
          {mode === "signup" && (
            <>Already have an account? <button type="button" onClick={() => { setMode("signin"); setInfo(null); }} className="text-terracotta font-semibold hover:underline">Sign in</button></>
          )}
          {mode === "forgot" && (
            <button type="button" onClick={() => { setMode("signin"); setInfo(null); }} className="text-slate-600 hover:text-espresso">← Back to sign in</button>
          )}
        </div>
      </form>
    </div>
  );
}
