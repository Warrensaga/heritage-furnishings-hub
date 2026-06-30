import { createServerFn } from "@tanstack/react-start";

export const adminSignUp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string; inviteCode: string }) => {
    if (!data || typeof data.email !== "string" || typeof data.password !== "string" || typeof data.inviteCode !== "string") {
      throw new Error("Invalid input");
    }
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters");
    if (!data.inviteCode) throw new Error("Invite code required");
    return { email, password: data.password, inviteCode: data.inviteCode };
  })
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_INVITE_CODE;
    if (!expected) throw new Error("Admin sign-up is not configured.");

    // Constant-time-ish compare
    const a = Buffer.from(data.inviteCode);
    const b = Buffer.from(expected);
    let mismatch = a.length !== b.length ? 1 : 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) mismatch |= a[i] ^ b[i];
    if (mismatch !== 0) {
      throw new Error("Invalid invite code");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true, userId: created.user?.id };
  });
