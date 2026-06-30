import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset password" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery tokens in the URL hash and exchanges them for a session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(!!session);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="font-display font-bold text-espresso text-xl">MANDELA HERITAGE</div>
          <div className="text-[10px] tracking-[0.3em] text-terracotta mt-1">RESET PASSWORD</div>
        </div>

        {!ready ? (
          <p className="text-sm text-slate-500 text-center">Loading…</p>
        ) : !hasSession ? (
          <div className="text-sm text-slate-600 space-y-3">
            <p>This reset link is invalid or has expired.</p>
            <p>Request a new one from the admin login page.</p>
            <button onClick={() => navigate({ to: "/admin/login" })} className="w-full bg-terracotta text-white font-semibold py-2.5 rounded hover:bg-terracotta/90">Back to login</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="block text-xs font-semibold text-slate-700">New password</label>
            <input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
            <label className="block text-xs font-semibold text-slate-700 mt-4">Confirm password</label>
            <input required type="password" minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-terracotta" />
            <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>
            <button disabled={loading} className="mt-6 w-full bg-terracotta text-white font-semibold py-2.5 rounded hover:bg-terracotta/90 disabled:opacity-50">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
