import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, type SiteContent, CONTENT_KEY } from "@/lib/site-content";

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
type MembershipRow = { user_id: string; plan: string; status: string; start_date: string; end_date: string | null };

function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"content" | "members">("content");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Record<string, MembershipRow>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", CONTENT_KEY).maybeSingle();
      if (data?.value) setContent({ ...DEFAULT_CONTENT, ...(data.value as Partial<SiteContent>) });
      const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setMembers((p ?? []) as Member[]);
      const { data: m } = await supabase.from("memberships").select("*");
      const map: Record<string, MembershipRow> = {};
      (m ?? []).forEach((r) => { map[(r as MembershipRow).user_id] = r as MembershipRow; });
      setMemberships(map);
    })();
  }, []);

  async function saveContent() {
    setSaving(true); setMsg(null);
    const { error } = await supabase.from("site_content").upsert({ key: CONTENT_KEY, value: content as never });
    setSaving(false);
    setMsg(error ? error.message : "Site updated! Refresh the home page.");
  }

  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/" }); }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="container-x flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-display">Ω</div>
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
          {(["content", "members"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "content" ? "Site content" : `Members (${members.length})`}
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
              <Input label="Hours" value={content.hours} onChange={(v) => setContent({ ...content, hours: v })} />
              <Input label="Map embed query (Google Maps query, e.g. 'Avenue Habib Bourguiba, Beni Khiar')" value={content.mapQuery} onChange={(v) => setContent({ ...content, mapQuery: v })} />
            </Section>

            <div className="flex items-center gap-4 sticky bottom-4 bg-card border border-border rounded-lg p-4 shadow-2xl">
              <button onClick={saveContent} disabled={saving} className="rounded-md bg-primary text-primary-foreground px-6 py-2.5 font-bold disabled:opacity-60">
                {saving ? "Saving..." : "Save site content"}
              </button>
              {msg && <span className="text-sm text-primary">{msg}</span>}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
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
                      <td className="px-4 py-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {members.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No members yet.</td></tr>
                )}
              </tbody>
            </table>
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
