import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import omegaLogo from "@/assets/omega-logo.jpg.asset.json";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — Omega Fitness" }] }),
  component: Account,
});

type Profile = { id: string; email: string | null; full_name: string | null; phone: string | null; fitness_goal: string | null; avatar_url: string | null };
type Membership = { plan: string; status: string; start_date: string; end_date: string | null };
type PlanRequest = { id: string; plan: string; message: string | null; status: string; created_at: string };

function Account() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [request, setRequest] = useState<PlanRequest | null>(null);
  const [reqPlan, setReqPlan] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [reqMsg, setReqMsg] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);

  async function loadRequest(userId: string) {
    const { data } = await (supabase as any).from("plan_requests")
      .select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setRequest((data ?? null) as PlanRequest | null);
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: m }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("memberships").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle(),
      ]);
      setProfile(p as Profile | null);
      setMembership(m as Membership | null);
      setIsAdmin(!!r);
      await loadRequest(u.user.id);
    })();
  }, []);

  async function submitRequest() {
    if (!profile) return;
    setReqSubmitting(true);
    await (supabase as any).from("plan_requests").insert({
      user_id: profile.id, plan: reqPlan, message: reqMsg || null, status: "pending",
    });
    setReqMsg("");
    await loadRequest(profile.id);
    setReqSubmitting(false);
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      fitness_goal: profile.fitness_goal,
    }).eq("id", profile.id);
    setSaving(false);
    setMsg(error ? error.message : "Saved!");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const daysLeft = membership?.end_date
    ? Math.max(0, Math.ceil((+new Date(membership.end_date) - Date.now()) / 86400000))
    : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container-x flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-display">Ω</div>
            <div className="font-display tracking-wider">OMEGA FITNESS</div>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" className="text-sm rounded-md border border-border px-3 py-1.5 hover:border-primary">Admin</Link>
            )}
            <button onClick={signOut} className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-semibold">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-12 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h1 className="font-display text-3xl">MY PROFILE</h1>
          <p className="text-sm text-muted-foreground">Keep your info up to date.</p>
          {profile ? (
            <div className="mt-6 grid gap-4">
              <Field label="Email"><div className="text-muted-foreground">{profile.email}</div></Field>
              <Field label="Full name">
                <input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full rounded-md bg-background border border-border px-3 py-2" />
              </Field>
              <Field label="Phone">
                <input value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+216 ..." className="w-full rounded-md bg-background border border-border px-3 py-2" />
              </Field>
              <Field label="Fitness goal">
                <textarea value={profile.fitness_goal ?? ""} onChange={(e) => setProfile({ ...profile, fitness_goal: e.target.value })} rows={3} placeholder="What are you training for?" className="w-full rounded-md bg-background border border-border px-3 py-2" />
              </Field>
              <div className="flex items-center gap-3">
                <button onClick={save} disabled={saving} className="rounded-md bg-primary text-primary-foreground px-5 py-2 font-semibold disabled:opacity-60">
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {msg && <span className="text-sm text-primary">{msg}</span>}
              </div>
            </div>
          ) : <div className="text-muted-foreground mt-4">Loading…</div>}
        </section>

        <aside className="rounded-xl border border-primary/40 bg-card p-6">
          <div className="text-xs tracking-widest text-primary">MEMBERSHIP</div>
          {membership ? (
            <>
              <div className="font-display text-3xl mt-2 capitalize">{membership.plan}</div>
              <div className="mt-3 text-sm"><span className="text-muted-foreground">Status: </span><span className="text-primary capitalize">{membership.status}</span></div>
              <div className="mt-1 text-sm"><span className="text-muted-foreground">Started: </span>{membership.start_date}</div>
              {membership.end_date && (
                <div className="mt-1 text-sm"><span className="text-muted-foreground">Ends: </span>{membership.end_date}</div>
              )}
              {daysLeft !== null && (
                <div className="mt-4 rounded-lg bg-primary/15 p-3">
                  <div className="font-display text-4xl text-primary">{daysLeft}</div>
                  <div className="text-xs text-muted-foreground">days remaining</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="font-display text-2xl mt-2">No active plan</div>
              <p className="text-sm text-muted-foreground mt-2">Visit the gym or call us to activate a plan.</p>
              <a href="tel:+21620084304" className="mt-4 block text-center rounded-md bg-primary text-primary-foreground py-2 font-semibold">Call +216 20 084 304</a>
            </>
          )}
        </aside>

        <section className="lg:col-span-3 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">REQUEST A PLAN</h2>
          <p className="text-sm text-muted-foreground">Pick a plan and submit a request. An admin will review and activate it.</p>
          {request && request.status === "pending" ? (
            <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
              <div className="text-sm">Your request for <span className="text-primary font-semibold capitalize">{request.plan}</span> is <span className="text-primary font-semibold">pending</span> review.</div>
              {request.message && <div className="text-xs text-muted-foreground mt-1">"{request.message}"</div>}
            </div>
          ) : (
            <>
              {request && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Last request: <span className="capitalize">{request.plan}</span> — <span className={request.status === "approved" ? "text-primary" : ""}>{request.status}</span>
                </div>
              )}
              <div className="mt-4 grid sm:grid-cols-3 gap-2">
                {(["monthly", "quarterly", "annual"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setReqPlan(p)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold capitalize transition ${reqPlan === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}>
                    {p}
                  </button>
                ))}
              </div>
              <textarea value={reqMsg} onChange={(e) => setReqMsg(e.target.value)} rows={3} placeholder="Optional message…"
                className="mt-3 w-full rounded-md bg-background border border-border px-3 py-2" />
              <button onClick={submitRequest} disabled={reqSubmitting}
                className="mt-3 rounded-md bg-primary text-primary-foreground px-5 py-2 font-semibold disabled:opacity-60">
                {reqSubmitting ? "Submitting…" : "Submit request"}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs tracking-widest text-muted-foreground mb-1">{label.toUpperCase()}</div>
      {children}
    </label>
  );
}
