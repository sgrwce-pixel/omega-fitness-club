import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY verification route — deleted immediately after the check.
export const Route = createFileRoute("/api/public/tmp-selftest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("token") !== "omega-verify-7731") {
          return new Response("nope", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = `verify.member.${Date.now()}@example.com`;
        const password = "TempPass123!x";
        const out: Record<string, unknown> = { email };

        const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: "Verify Member" },
        });
        out['createUser'] = cErr ? `ERROR ${cErr.message}` : `ok ${created.user?.id}`;
        if (!created?.user) return Response.json(out);

        const { error: pErr } = await supabaseAdmin
          .from("profiles")
          .upsert({ id: created.user.id, email, full_name: "Verify Member" });
        out['profileUpsert'] = pErr ? `ERROR ${pErr.message}` : "ok";

        const { data: prof } = await supabaseAdmin
          .from("profiles").select("id, email, full_name").eq("id", created.user.id).maybeSingle();
        out['profileRow'] = prof;

        const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
        const res = await fetch(`${process.env['SUPABASE_URL']}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: { apikey: key, "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = (await res.json()) as { access_token?: string; msg?: string };
        out['passwordLogin'] = res.status === 200 && json.access_token ? "ok (access_token issued)" : `FAIL ${res.status} ${json.msg}`;

        const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(created.user.id);
        out['cleanup'] = dErr ? `ERROR ${dErr.message}` : "deleted";
        return Response.json(out);
      },
    },
  },
});
