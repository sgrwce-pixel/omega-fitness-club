import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CreateMemberInput = { email: string; password: string; fullName: string; phone?: string };

function validate(input: CreateMemberInput): CreateMemberInput {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const fullName = String(input.fullName ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 8 || password.length > 72) throw new Error("Password must be 8–72 characters.");
  if (fullName.length < 2 || fullName.length > 120) throw new Error("Full name must be 2–120 characters.");
  if (phone.length > 32) throw new Error("Phone is too long.");
  return { email, password, fullName, phone };
}

export const createMemberAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateMemberInput) => validate(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Authorize: caller must have the admin role (checked as the caller, under RLS).
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) throw new Error("Could not verify admin access.");
    if (!roleRow) throw new Error("Forbidden: admin access required.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Could not create the account.");
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: created.user.id,
        email: data.email,
        full_name: data.fullName,
        ...(data.phone ? { phone: data.phone } : {}),
      });
    if (profileError) throw new Error(`Account created, but profile failed: ${profileError.message}`);

    return { id: created.user.id, email: data.email };
  });
