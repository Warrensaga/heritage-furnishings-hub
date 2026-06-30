import { createServerFn } from "@tanstack/react-start";

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  let mismatch = ab.length !== bb.length ? 1 : 0;
  const len = Math.min(ab.length, bb.length);
  for (let i = 0; i < len; i++) mismatch |= ab[i] ^ bb[i];
  return mismatch === 0;
}

export const adminSignUp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string; inviteCode?: string }) => {
    if (!data || typeof data.email !== "string" || typeof data.password !== "string") {
      throw new Error("Invalid input");
    }
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters");
    return { email, password: data.password, inviteCode: (data.inviteCode ?? "").trim() };
  })
  .handler(async ({ data }) => {
    const expectedCode = (process.env.ADMIN_INVITE_CODE ?? "").trim();
    const allowlist = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const emailAllowed = allowlist.includes(data.email);
    const codeValid = !!data.inviteCode && !!expectedCode && timingSafeEqualStr(data.inviteCode, expectedCode);

    if (!emailAllowed && !codeValid) {
      if (!expectedCode && allowlist.length === 0) {
        return { ok: false as const, error: "Admin sign-up is not configured." };
      }
      return { ok: false as const, error: "Email not allowlisted and invite code is missing or invalid." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, userId: created.user?.id };
  });
