import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import dontGiveUp from "@/assets/dont-give-up.png.asset.json";
import dumbbells from "@/assets/dumbbells.png.asset.json";
import stayStrong from "@/assets/stay-strong.png.asset.json";
import stronger from "@/assets/stronger.png.asset.json";
import cableMachine from "@/assets/cable-machine.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, type SiteContent, CONTENT_KEY } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  component: Home,
});

const stats = [
  { n: "500+", l: "Active Members" },
  { n: "2", l: "Expert Coaches" },
  { n: "50+", l: "Weekly Sessions" },
  { n: "7", l: "Days a Week" },
];

const reviews = [
  { q: "Best gym in the region. Equipment is top tier and the vibe pushes you to give your best every session.", n: "Ahmed Chtioui" },
  { q: "Friendly coaches, clean space, and real results. Omega Fitness truly changed my routine and my confidence.", n: "Soumaya Zardoum" },
  { q: "I love training here. The energy is unmatched and the team genuinely cares about your progress.", n: "Eslem Chtioui" },
];

function Home() {
  const [c, setC] = useState<SiteContent>(DEFAULT_CONTENT);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.from("site_content").select("value").eq("key", CONTENT_KEY).maybeSingle()
      .then(({ data }) => { if (data?.value) setC({ ...DEFAULT_CONTENT, ...(data.value as Partial<SiteContent>) }); });
    const checkAdmin = async (userId: string | undefined) => {
      if (!userId) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    };
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      checkAdmin(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSignedIn(!!s);
      checkAdmin(s?.user.id);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <Nav c={c} signedIn={signedIn} isAdmin={isAdmin} />

      <Hero c={c} />
      <Marquee />
      <About c={c} />
      <Programs c={c} />
      <Facility />
      <Pricing c={c} />
      <Reviews />
      <Contact c={c} />
      <Footer c={c} />
    </div>
  );
}

function Nav({ c, signedIn, isAdmin }: { c: SiteContent; signedIn: boolean; isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container-x flex items-center justify-between py-4">
        <a href="#top" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-xl">Ω</div>
          <div className="leading-tight">
            <div className="font-display tracking-wider text-lg">{c.brandName}</div>
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground">{c.tagline}</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {["About", "Programs", "Facility", "Pricing", "Contact"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-primary transition">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link to="/account" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary transition">
                My Account
              </Link>
              {isAdmin && (
                <Link to="/admin" className="rounded-md border border-primary bg-primary/10 text-primary px-3 py-2 text-sm font-semibold hover:bg-primary/20 transition">
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary transition">
              Sign In
            </Link>
          )}

          <a href="#pricing" className="rounded-md bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:opacity-90 transition">
            Join Now
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ c }: { c: SiteContent }) {
  const parts = c.heroTitle.split("{HL}");
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={dontGiveUp.url} alt="Don't give up wall art" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
      </div>
      <div className="container-x grid lg:grid-cols-2 gap-12 py-28 lg:py-40 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-xs tracking-[0.25em] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {c.locationBadge}
          </span>
          <h1 className="font-display mt-6 text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
            {parts[0]}
            <span className="text-primary" style={{ textShadow: "0 0 40px rgba(138,255,60,0.4)" }}>{c.heroHighlight}</span>
            {parts[1] ?? ""}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">{c.heroDescription}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#pricing" className="group inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 font-bold">
              Start Training <span className="transition group-hover:translate-x-1">→</span>
            </a>
            <a href="#facility" className="rounded-md border border-border bg-card px-6 py-3 font-semibold hover:border-primary transition">
              Tour the Gym
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="text-primary text-lg">★★★★★</div>
            <span className="text-muted-foreground">5.0 rated · loved by our community</span>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute -top-6 -left-6 right-6 bottom-6 border-2 border-primary/40 rounded-lg" />
          <img src={stayStrong.url} alt="Stay strong" className="relative rounded-lg w-full h-[560px] object-cover" />
          <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground font-display text-xl px-6 py-3 rounded-md rotate-3">
            NO EXCUSES
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = ["DISCIPLINE", "★", "STRENGTH", "★", "COMMUNITY", "★", "PROGRESS", "★", "NO EXCUSES", "★"];
  return (
    <div className="border-y border-border bg-primary text-primary-foreground overflow-hidden py-4">
      <div className="flex gap-12 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
        {[0, 1, 2].flatMap((i) => words.map((w, j) => (
          <span key={`${i}-${j}`} className="font-display text-2xl tracking-widest">{w}</span>
        )))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
    </div>
  );
}

function About({ c }: { c: SiteContent }) {
  return (
    <section id="about" className="container-x py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img src={cableMachine.url} alt="Training floor" className="rounded-lg w-full h-[520px] object-cover" />
          <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-5 max-w-[220px] shadow-2xl">
            <div className="text-xs text-muted-foreground tracking-widest">EST. 2024</div>
            <div className="font-display text-xl mt-1">A new era of training</div>
          </div>
        </div>
        <div>
          <div className="text-primary text-xs tracking-[0.3em] font-semibold">ABOUT {c.brandName}</div>
          <h2 className="font-display text-5xl md:text-6xl mt-3 leading-none">
            MORE THAN A GYM.<br />
            <span className="text-primary">A LIFESTYLE.</span>
          </h2>
          <p className="mt-6 text-muted-foreground">{c.aboutP1}</p>
          <p className="mt-4 text-muted-foreground">{c.aboutP2}</p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              ["Premium Equipment", "Hammer Strength & more"],
              ["Certified Coaches", "Personalized programs"],
              ["Open Late", "Until 11 PM daily"],
              ["Community", "Train with the best"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-border bg-card p-4">
                <div className="font-semibold">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl md:text-4xl text-primary">{s.n}</div>
                <div className="text-xs text-muted-foreground tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Programs({ c }: { c: SiteContent }) {
  return (
    <section id="programs" className="bg-card border-y border-border py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-primary text-xs tracking-[0.3em] font-semibold">WHAT WE OFFER</div>
            <h2 className="font-display text-5xl md:text-6xl mt-3">TRAIN YOUR WAY</h2>
          </div>
          <p className="max-w-md text-muted-foreground">Four core paths. One mission — make you stronger every single session.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {c.programs.map((p, i) => (
            <div key={p.title + i} className="group relative overflow-hidden rounded-lg border border-border bg-background p-6 hover:border-primary transition">
              <div className="font-display text-6xl text-border group-hover:text-primary/20 transition">0{i + 1}</div>
              <h3 className="font-display text-2xl mt-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-3">{p.desc}</p>
              <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full border border-border grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Facility() {
  return (
    <section id="facility" className="container-x py-24 lg:py-32">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-primary text-xs tracking-[0.3em] font-semibold">THE FACILITY</div>
        <h2 className="font-display text-5xl md:text-6xl mt-3">BUILT FOR <span className="text-primary">RESULTS</span></h2>
        <p className="mt-4 text-muted-foreground">From premium dumbbells to a full functional zone — every square meter is designed to push you further.</p>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <img src={dumbbells.url} alt="Hammer Strength dumbbells" className="col-span-12 md:col-span-8 h-[360px] w-full object-cover rounded-lg" />
        <img src={stronger.url} alt="Stronger than you think" className="col-span-12 md:col-span-4 h-[360px] w-full object-cover rounded-lg" />
        <img src={cableMachine.url} alt="Cable machines" className="col-span-12 md:col-span-5 h-[320px] w-full object-cover rounded-lg" />
        <img src={stayStrong.url} alt="Stay strong poster" className="col-span-12 md:col-span-4 h-[320px] w-full object-cover rounded-lg" />
        <div className="col-span-12 md:col-span-3 rounded-lg bg-primary text-primary-foreground p-6 flex flex-col justify-between">
          <div className="font-display text-3xl leading-none">COME SEE IT FOR YOURSELF.</div>
          <a href="#contact" className="inline-flex items-center gap-2 font-semibold mt-4">Visit us →</a>
        </div>
      </div>
    </section>
  );
}

function Pricing({ c }: { c: SiteContent }) {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 border-y border-border bg-card">
      <div className="container-x">
        <div className="text-center mb-14">
          <div className="text-primary text-xs tracking-[0.3em] font-semibold">MEMBERSHIPS</div>
          <h2 className="font-display text-5xl md:text-6xl mt-3">CHOOSE YOUR PLAN</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {c.plans.map((p) => (
            <div key={p.name} className={`relative rounded-xl border p-8 ${p.popular ? "border-primary bg-background neon-glow" : "border-border bg-background"}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-widest px-3 py-1 rounded">
                  MOST POPULAR
                </div>
              )}
              <div className="font-display text-2xl tracking-wider">{p.name.toUpperCase()}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-6xl text-primary">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.per}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-primary">✓</span> {f}</li>
                ))}
              </ul>
              <Link to="/auth" className={`mt-8 block text-center rounded-md py-3 font-semibold transition ${p.popular ? "bg-primary text-primary-foreground" : "border border-border hover:border-primary"}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="container-x py-24 lg:py-32">
      <div className="text-center mb-14">
        <div className="text-primary text-xs tracking-[0.3em] font-semibold">REVIEWS</div>
        <h2 className="font-display text-5xl md:text-6xl mt-3">RATED 5.0 <span className="text-primary">★</span></h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div key={r.n} className="rounded-lg border border-border bg-card p-6">
            <div className="text-primary mb-3">★★★★★</div>
            <p className="text-foreground/90">"{r.q}"</p>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="font-semibold">{r.n}</div>
              <div className="text-xs text-muted-foreground">Verified member</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact({ c }: { c: SiteContent }) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed`;
  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden border-t border-border">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-primary text-xs tracking-[0.3em] font-semibold">VISIT US</div>
          <h2 className="font-display text-5xl md:text-7xl mt-3 leading-none">
            READY TO <span className="text-primary">START?</span>
          </h2>
          <p className="mt-6 text-muted-foreground">Drop by for a tour or call us — your transformation begins the moment you walk in.</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-xl overflow-hidden border border-border bg-card h-[440px]">
            <iframe
              title="Omega Fitness location"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(0.4) contrast(1.1)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="lg:col-span-2 grid gap-4 content-start">
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`} target="_blank" rel="noreferrer" className="block rounded-lg border border-border bg-card p-6 hover:border-primary transition">
              <div className="text-xs tracking-widest text-primary">LOCATION</div>
              <div className="font-display text-2xl mt-2">{c.address}</div>
              <div className="text-muted-foreground">{c.addressSub}</div>
            </a>
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="block rounded-lg border border-border bg-card p-6 hover:border-primary transition">
              <div className="text-xs tracking-widest text-primary">CALL</div>
              <div className="font-display text-2xl mt-2">{c.phone}</div>
              {c.phone2 && (
                <a href={`tel:${c.phone2.replace(/\s/g, "")}`} className="block font-display text-2xl text-foreground/90 hover:text-primary">{c.phone2}</a>
              )}
              <div className="text-muted-foreground mt-1">Call or WhatsApp to book your visit</div>
            </a>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-6">
              <div className="text-xs tracking-widest text-primary">HOURS</div>
              <div className="font-display text-2xl mt-2">{c.hours}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-card p-4 hover:border-primary transition">
                <div className="text-xs tracking-widest text-primary">INSTAGRAM</div>
                <div className="font-display text-base mt-1 truncate">@{c.instagram.replace(/^@/, "")}</div>
              </a>
              <a href={c.facebookUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-card p-4 hover:border-primary transition">
                <div className="text-xs tracking-widest text-primary">FACEBOOK</div>
                <div className="font-display text-base mt-1 truncate">{c.facebook}</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ c }: { c: SiteContent }) {
  return (
    <footer className="border-t border-border py-10">
      <div className="container-x flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground grid place-items-center font-display">Ω</div>
          <span>© {new Date().getFullYear()} {c.brandName} · Beni Khiar, Tunisia</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary">@{c.instagram.replace(/^@/, "")}</a>
          <a href={c.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-primary">{c.facebook}</a>
          <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-primary">{c.phone}</a>
        </div>
        <div className="font-display tracking-widest">DON'T GIVE UP.</div>
      </div>
    </footer>
  );
}
