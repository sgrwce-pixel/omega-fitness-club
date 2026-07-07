import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, type SiteContent, CONTENT_KEY } from "@/lib/site-content";
import omegaLogo from "@/assets/omega-logo.jpg.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Omega Fitness" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase
      .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/account" });
  },
  component: Admin,
});

type Member = {
  id: string; email: string | null; full_name: string | null; phone: string | null;
  created_at: string;
};
type MembershipRow = { id?: string; user_id: string; plan: string; status: string; start_date: string; end_date: string | null };
type PlanRequest = { id: string; user_id: string; plan: string; message: string | null; status: string; created_at: string };

function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"content" | "members" | "requests">("content");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Record<string, MembershipRow>>({});
  const [endDates, setEndDates] = useState<Record<string, string>>({});
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadAll() {
    const { data } = await supabase.from("site_content").select("value").eq("key", CONTENT_KEY).maybeSingle();
    if (data?.value) setContent({ ...DEFAULT_CONTENT, ...(data.value as Partial<SiteContent>) });
    const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setMembers((p ?? []) as Member[]);
    const { data: m } = await supabase.from("memberships").select("*");
    const map: Record<string, MembershipRow> = {};
    const dates: Record<string, string> = {};
    (m ?? []).forEach((r) => {
      const row = r as MembershipRow;
      map[row.user_id] = row;
      dates[row.user_id] = row.end_date ?? "";
    });
    setMemberships(map);
    setEndDates(dates);
    const { data: rq } = await (supabase as any).from("plan_requests")
      .select("*").order("created_at", { ascending: false });
    setRequests((rq ?? []) as PlanRequest[]);
  }

  useEffect(() => { loadAll(); }, []);

  async function saveContent() {
    setSaving(true); setMsg(null);
    const { error } = await supabase.from("site_content").upsert({ key: CONTENT_KEY, value: content as never });
    setSaving(false);
    setMsg(error ? error.message : "Site updated! Refresh the home page.");
  }

  async function saveEndDate(userId: string) {
    const ms = memberships[userId];
    const end = endDates[userId] || null;
    if (ms) {
      await supabase.from("memberships").update({ end_date: end }).eq("user_id", userId);
    } else {
      await supabase.from("memberships").insert({
        user_id: userId, plan: "monthly", status: "active",
        start_date: new Date().toISOString().slice(0, 10), end_date: end,
      } as never);
    }
    await loadAll();
  }

  async function approveRequest(r: PlanRequest) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = memberships[r.user_id];
    if (existing?.id) {
      await supabase.from("memberships").update({
        plan: r.plan, status: "active", start_date: today,
      }).eq("id", existing.id);
    } else {
      await supabase.from("memberships").insert({
        user_id: r.user_id, plan: r.plan, status: "active", start_date: today,
      } as never);
    }
    await (supabase as any).from("plan_requests").update({ status: "approved" }).eq("id", r.id);
    await loadAll();
  }

  async function rejectRequest(r: PlanRequest) {
    await (supabase as any).from("plan_requests").update({ status: "rejected" }).eq("id", r.id);
    await loadAll();
  }

  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/" }); }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="container-x flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-primary/20 bg-card p-1 shadow-[0_0_20px_-5px_rgba(132,204,22,0.35)] flex items-center justify-center">
              <img src={omegaLogo.url} alt="Omega Fitness logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-display tracking-wider">OMEGA FITNESS</div>
              <div className="text-[10px] tracking-widest text-primary">ADMIN PANEL</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/account" className="text-sm rounded-md border border-border px-3 py-1.5 hover:border-primary">My account</Link>
            <button onClick={signOut} className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-semibold">Sign out</button>
          </div>
        </div>
        <div className="container-x flex gap-1 -mb-px">
          {(["content", "members", "requests"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "content" ? "Site content" : t === "members" ? `Members (${members.length})` : `Plan Requests${pendingCount ? ` (${pendingCount})` : ""}`}
            </button>
          ))}
        </div>
      </header>

      <main className="container-x py-10">
        {tab === "content" ? (
          <div className="grid gap-8 max-w-3xl">
            <Section title="Brand">
              <Input label="Brand name" value={content.brandName} onChange={(v) => setContent({ ...content, brandName: v })} />
              <Input label="Tagline" value={content.tagline} onChange={(v) => setContent({ ...content, tagline: v })} />
              <Input label="Location badge" value={content.locationBadge} onChange={(v) => setContent({ ...content, locationBadge: v })} />
            </Section>

            <Section title="Hero">
              <Input label="Hero title" value={content.heroTitle} onChange={(v) => setContent({ ...content, heroTitle: v })} />
              <Input label="Hero highlight word" value={content.heroHighlight} onChange={(v) => setContent({ ...content, heroHighlight: v })} />
              <Textarea label="Hero description" value={content.heroDescription} onChange={(v) => setContent({ ...content, heroDescription: v })} />
            </Section>

            <Section title="About">
              <Textarea label="About paragraph 1" value={content.aboutP1} onChange={(v) => setContent({ ...content, aboutP1: v })} />
              <Textarea label="About paragraph 2" value={content.aboutP2} onChange={(v) => setContent({ ...content, aboutP2: v })} />
            </Section>

            <Section title="Programs">
              {content.programs.map((p, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-2">
                  <Input label={`#${i + 1} title`} value={p.title} onChange={(v) => {
                    const next = [...content.programs]; next[i] = { ...p, title: v }; setContent({ ...content, programs: next });
                  }} />
                  <Input label={`#${i + 1} description`} value={p.desc} onChange={(v) => {
                    const next = [...content.programs]; next[i] = { ...p, desc: v }; setContent({ ...content, programs: next });
                  }} />
                </div>
              ))}
            </Section>

            <Section title="Pricing">
              {content.plans.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-4 grid sm:grid-cols-3 gap-2">
                  <Input label="Name" value={p.name} onChange={(v) => { const next = [...content.plans]; next[i] = { ...p, name: v }; setContent({ ...content, plans: next }); }} />
                  <Input label="Price" value={p.price} onChange={(v) => { const next = [...content.plans]; next[i] = { ...p, price: v }; setContent({ ...content, plans: next }); }} />
                  <Input label="Per" value={p.per} onChange={(v) => { const next = [...content.plans]; next[i] = { ...p, per: v }; setContent({ ...content, plans: next }); }} />
                  <div className="sm:col-span-3">
                    <Textarea label="Features (one per line)" value={p.feats.join("\n")} onChange={(v) => { const next = [...content.plans]; next[i] = { ...p, feats: v.split("\n").filter(Boolean) }; setContent({ ...content, plans: next }); }} />
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Contact">
              <Input label="Address line" value={content.address} onChange={(v) => setContent({ ...content, address: v })} />
              <Input label="Address subline" value={content.addressSub} onChange={(v) => setContent({ ...content, addressSub: v })} />
              <Input label="Phone" value={content.phone} onChange={(v) => setContent({ ...content, phone: v })} />
              <Input label="Phone 2 (WhatsApp)" value={content.phone2} onChange={(v) => setContent({ ...content, phone2: v })} />
              <Input label="Hours" value={content.hours} onChange={(v) => setContent({ ...content, hours: v })} />
              <MapLocationField value={content.mapQuery} onChange={(v) => setContent({ ...content, mapQuery: v })} />
              <Input label="Instagram handle" value={content.instagram} onChange={(v) => setContent({ ...content, instagram: v })} />
              <Input label="Instagram URL" value={content.instagramUrl} onChange={(v) => setContent({ ...content, instagramUrl: v })} />
              <Input label="Facebook page name" value={content.facebook} onChange={(v) => setContent({ ...content, facebook: v })} />
              <Input label="Facebook URL" value={content.facebookUrl} onChange={(v) => setContent({ ...content, facebookUrl: v })} />

            </Section>

            <div className="flex items-center gap-4 sticky bottom-4 bg-card border border-border rounded-lg p-4 shadow-2xl">
              <button onClick={saveContent} disabled={saving} className="rounded-md bg-primary text-primary-foreground px-6 py-2.5 font-bold disabled:opacity-60">
                {saving ? "Saving..." : "Save site content"}
              </button>
              {msg && <span className="text-sm text-primary">{msg}</span>}
            </div>
          </div>
        ) : tab === "members" ? (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">End date</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const ms = memberships[m.id];
                  return (
                    <tr key={m.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">{m.full_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.phone || "—"}</td>
                      <td className="px-4 py-3 capitalize">{ms?.plan || "—"}</td>
                      <td className="px-4 py-3"><span className={ms?.status === "active" ? "text-primary" : "text-muted-foreground"}>{ms?.status || "none"}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={endDates[m.id] ?? ""}
                            onChange={(e) => setEndDates({ ...endDates, [m.id]: e.target.value })}
                            className="rounded-md bg-background border border-border px-2 py-1"
                          />
                          <button onClick={() => saveEndDate(m.id)} className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">Save</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {members.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No members yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3">
            {requests.length === 0 && (
              <div className="rounded-xl border border-border p-8 text-center text-muted-foreground">No plan requests yet.</div>
            )}
            {requests.map((r) => {
              const member = members.find((m) => m.id === r.user_id);
              return (
                <div key={r.id} className="rounded-xl border border-border bg-card p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{member?.full_name || "—"} <span className="text-muted-foreground text-sm">· {member?.email}</span></div>
                    <div className="text-sm mt-1">Requested plan: <span className="text-primary capitalize font-semibold">{r.plan}</span></div>
                    {r.message && <div className="text-sm text-muted-foreground mt-1">"{r.message}"</div>}
                    <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()} · status: <span className="capitalize">{r.status}</span></div>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => approveRequest(r)} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-bold">Approve</button>
                      <button onClick={() => rejectRequest(r)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-primary">Reject</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl mb-4">{title.toUpperCase()}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-xs tracking-widest text-muted-foreground mb-1">{label.toUpperCase()}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary" />
    </label>
  );
}
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-xs tracking-widest text-muted-foreground mb-1">{label.toUpperCase()}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full rounded-md bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary" />
    </label>
  );
}

function MapLocationField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const trimmed = (value || "").trim();
  const coords = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  let mode = "Address / place name";
  if (/^https?:\/\//i.test(trimmed)) mode = "Google Maps URL";
  else if (coords) mode = `Coordinates (lat ${coords[1]}, lng ${coords[2]})`;
  const previewSrc = /^https?:\/\/(www\.)?google\.[^/]+\/maps\/embed/i.test(trimmed)
    ? trimmed
    : coords
      ? `https://www.google.com/maps?q=${coords[1]},${coords[2]}&z=17&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(trimmed || "Beni Khiar, Tunisia")}&output=embed`;
  return (
    <div className="space-y-2">
      <label className="block">
        <div className="text-xs tracking-widest text-muted-foreground mb-1">MAP LOCATION</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Address, 'lat,lng' coordinates, or a Google Maps URL"
          className="w-full rounded-md bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary"
        />
      </label>
      <div className="text-xs text-muted-foreground leading-relaxed">
        Detected: <span className="text-primary font-semibold">{mode}</span>.
        For the most precise pin, open{" "}
        <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline hover:text-primary">Google Maps</a>,
        right-click your exact spot, click the coordinates to copy them, then paste here (e.g. <code className="text-foreground">36.4561,10.8123</code>).
        You can also paste a full Google Maps share link or embed URL.
      </div>
      <div className="rounded-md overflow-hidden border border-border h-56">
        <iframe
          title="Map preview"
          src={previewSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

