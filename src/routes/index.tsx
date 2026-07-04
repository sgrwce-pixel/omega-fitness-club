import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.remove("number-pop");
          // force reflow to restart the animation
          void el.offsetWidth;
          el.classList.add("number-pop");
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="font-display text-3xl md:text-4xl text-primary inline-block">{value}</div>;
}

import dontGiveUp from "@/assets/dont-give-up.png.asset.json";
import dumbbells from "@/assets/dumbbells.png.asset.json";
import stayStrong from "@/assets/stay-strong.png.asset.json";
import stronger from "@/assets/stronger.png.asset.json";
import cableMachine from "@/assets/cable-machine.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, type SiteContent, CONTENT_KEY } from "@/lib/site-content";
import { LanguageSwitcher, applyTranslations, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Omega Fitness Club | Gym in Beni Khiar, Tunisia" },
      { name: "description", content: "Omega Fitness Club in Beni Khiar, Tunisia — premium strength & cardio equipment, expert coaches, group classes and personal training. Open daily until 11pm." },
      { property: "og:title", content: "Omega Fitness Club | Gym in Beni Khiar, Tunisia" },
      { property: "og:description", content: "Premium gym in Beni Khiar with strength, cardio, coaching and group classes. Join the strongest community in Tunisia." },
      { property: "og:url", content: "https://omega-fitness-club.lovable.app/" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Omega Fitness" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Omega Fitness Club | Gym in Beni Khiar, Tunisia" },
      { name: "twitter:description", content: "Premium gym in Beni Khiar with strength, cardio, coaching and group classes." },
    ],
    links: [{ rel: "canonical", href: "https://omega-fitness-club.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Omega Fitness",
          url: "https://omega-fitness-club.lovable.app",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Omega Fitness",
          url: "https://omega-fitness-club.lovable.app",
          logo: "https://omega-fitness-club.lovable.app/favicon.ico",
          sameAs: [
            "https://instagram.com/omegafitness.club",
            "https://facebook.com/club.omegafit",
          ],
        }),
      },
    ],
  }),
  component: Home,
});


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

  // Trigger animations only when elements scroll into view.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-inview]");
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.classList.remove("in-view");
          void el.offsetWidth; // restart animation
          el.classList.add("in-view");
          if (el.dataset.inview === "once") obs.unobserve(el);
        } else {
          (e.target as HTMLElement).classList.remove("in-view");
        }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -10% 0px" });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [c]);


  const { t } = useI18n();
  const tc = applyTranslations(c, t);
  return (
    <div className="min-h-screen text-foreground">
      <Nav c={tc} signedIn={signedIn} isAdmin={isAdmin} />

      <Hero c={tc} />
      <Marquee />
      <About c={tc} />
      <Programs c={tc} />
      <Facility />
      <Pricing c={tc} />
      <Reviews />
      <Contact c={tc} />
      <Footer c={tc} />
    </div>
  );
}

function Nav({ c, signedIn, isAdmin }: { c: SiteContent; signedIn: boolean; isAdmin: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const links: { key: string; label: string; href: string }[] = [
    { key: "about", label: t.navAbout, href: "#about" },
    { key: "programs", label: t.navPrograms, href: "#programs" },
    { key: "facility", label: t.navFacility, href: "#facility" },
    { key: "pricing", label: t.navPricing, href: "#pricing" },
    { key: "contact", label: t.navContact, href: "#contact" },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container-x flex items-center justify-between gap-3 py-3 sm:py-4">
        <a href="#top" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-lg sm:text-xl">Ω</div>
          <div className="leading-tight min-w-0">
            <div className="font-display tracking-wider text-base sm:text-lg truncate">{c.brandName}</div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground truncate hidden sm:block">{c.tagline}</div>
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <a key={l.key} href={l.href} className="hover:text-primary transition">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          {signedIn ? (
            <>
              <Link to="/account" className="hidden sm:inline-flex rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary transition">
                {t.myAccount}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hidden md:inline-flex rounded-md border border-primary bg-primary/10 text-primary px-3 py-2 text-sm font-semibold hover:bg-primary/20 transition">
                  {t.adminPanel}
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary transition">
              {t.signIn}
            </Link>
          )}

          <a href="#pricing" className="hidden sm:inline-flex rounded-md bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:opacity-90 transition">
            {t.joinNow}
          </a>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden relative w-10 h-10 grid place-items-center rounded-md border border-border text-foreground hover:border-primary transition"
          >
            <span className={`block w-5 h-0.5 bg-current absolute transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1.5"}`} />
            <span className={`block w-5 h-0.5 bg-current absolute transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`block w-5 h-0.5 bg-current absolute transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden border-t border-border transition-[max-height] duration-300 ease-out ${open ? "max-h-[80vh]" : "max-h-0"}`}
      >
        <div className="container-x py-4 flex flex-col gap-2">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-card hover:text-primary transition"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 pt-3 border-t border-border flex flex-wrap items-center gap-2">
            <LanguageSwitcher />
            {signedIn ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)} className="flex-1 min-w-[120px] text-center rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary transition">
                  {t.myAccount}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="flex-1 min-w-[120px] text-center rounded-md border border-primary bg-primary/10 text-primary px-3 py-2 text-sm font-semibold hover:bg-primary/20 transition">
                    {t.adminPanel}
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="flex-1 min-w-[120px] text-center rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary transition">
                {t.signIn}
              </Link>
            )}
            <a href="#pricing" onClick={() => setOpen(false)} className="flex-1 min-w-[120px] text-center rounded-md bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:opacity-90 transition">
              {t.joinNow}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}


function Hero({ c }: { c: SiteContent }) {
  const { t, dir } = useI18n();
  const parts = c.heroTitle.split("{HL}");
  const arrow = dir === "rtl" ? "←" : "→";
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={dontGiveUp.url} alt="Don't give up wall art" className="w-full h-full object-cover opacity-60" />
        <div className={`absolute inset-0 ${dir === "rtl" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-background via-background/85 to-background/30`} />
      </div>
      <div className="container-x grid lg:grid-cols-2 gap-12 py-20 sm:py-28 lg:py-40 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-xs tracking-[0.25em] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {c.locationBadge}
          </span>
          <h1 className="font-display mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
            {parts[0]}
            <span className="text-primary" style={{ textShadow: "0 0 40px rgba(138,255,60,0.4)" }}>{c.heroHighlight}</span>
            {parts[1] ?? ""}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">{c.heroDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <a href="#pricing" className="group inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 sm:px-6 py-3 font-bold btn-shine btn-3d">
              {t.startTraining} <span className={`transition ${dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>{arrow}</span>
            </a>
            <a href="#facility" className="rounded-md border border-border bg-card px-5 sm:px-6 py-3 font-semibold hover:border-primary transition btn-shine btn-3d-dark">
              {t.tourTheGym}
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="text-primary text-lg">★★★★★</div>
            <span className="text-muted-foreground">{t.ratedLine}</span>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute -top-6 -left-6 right-6 bottom-6 border-2 border-primary/40 rounded-lg tilt-soft" />
          <div className="img-zoom relative rounded-lg overflow-hidden">
            <img src={stayStrong.url} alt="Stay strong" className="rounded-lg w-full h-[560px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground font-display text-xl px-6 py-3 rounded-md rotate-3 jiggle" data-inview>
            {t.noExcusesBadge}
          </div>

        </div>
      </div>

    </section>
  );
}

function Marquee() {
  const words = ["DISCIPLINE", "★", "STRENGTH", "★", "COMMUNITY", "★", "PROGRESS", "★", "NO EXCUSES", "★"];
  return (
    <div className="border-y border-border bg-primary text-primary-foreground overflow-hidden py-4" dir="ltr">
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
  const { t } = useI18n();
  const stats = [
    { n: "500+", l: t.statActive },
    { n: "2", l: t.statCoaches },
    { n: "50+", l: t.statSessions },
    { n: "7", l: t.statDays },
  ];
  const feats: [string, string][] = [
    [t.featPremiumT, t.featPremiumD],
    [t.featCoachesT, t.featCoachesD],
    [t.featOpenT, t.featOpenD],
    [t.featCommT, t.featCommD],
  ];
  return (
    <section id="about" className="container-x py-16 sm:py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
        <div className="relative">
          <div className="img-zoom rounded-lg overflow-hidden">
            <img src={cableMachine.url} alt="Training floor" className="rounded-lg w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-2 sm:-left-6 bg-card border border-border rounded-lg p-4 sm:p-5 max-w-[200px] sm:max-w-[220px] shadow-2xl">
            <div className="text-xs text-muted-foreground tracking-widest">{t.est}</div>
            <div className="font-display text-lg sm:text-xl mt-1">{t.newEra}</div>
          </div>
        </div>
        <div>
          <div className="text-primary text-xs tracking-[0.3em] font-semibold">{t.aboutKicker} {c.brandName}</div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 leading-none text-jiggle-hover" data-inview="once">
            {t.aboutHeadline1}<br />
            <span className="text-primary">{t.aboutHeadline2}</span>
          </h2>
          <p className="mt-6 text-muted-foreground">{c.aboutP1}</p>
          <p className="mt-4 text-muted-foreground">{c.aboutP2}</p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {feats.map(([ttl, d]) => (
              <div key={ttl} className="rounded-lg border border-border bg-card p-4">
                <div className="font-semibold">{ttl}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.l}>
                <StatNumber value={s.n} />
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
  const { t, dir } = useI18n();
  const arrow = dir === "rtl" ? "←" : "→";
  return (
    <section id="programs" className="bg-card border-y border-border py-16 sm:py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="text-primary text-xs tracking-[0.3em] font-semibold">{t.programsKicker}</div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 text-jiggle-hover" data-inview="once">{t.programsHeadline}</h2>
          </div>
          <p className="max-w-md text-muted-foreground">{t.programsSub}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {c.programs.map((p, i) => (
            <div key={p.title + i} className="group relative overflow-hidden rounded-lg border border-border bg-background p-6 hover:border-primary transition wobble-on-hover" data-inview>
              <div className="font-display text-6xl text-border group-hover:text-primary/20 transition">0{i + 1}</div>
              <h3 className="font-display text-2xl mt-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-3">{p.desc}</p>
              <div className={`absolute bottom-4 ${dir === "rtl" ? "left-4" : "right-4"} w-8 h-8 rounded-full border border-border grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition`}>{arrow}</div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

function Facility() {
  const { t, dir } = useI18n();
  const arrow = dir === "rtl" ? "←" : "→";
  return (
    <section id="facility" className="container-x py-16 sm:py-24 lg:py-32">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="text-primary text-xs tracking-[0.3em] font-semibold">{t.facilityKicker}</div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 text-jiggle-hover" data-inview="once">{t.facilityHeadline1} <span className="text-primary">{t.facilityHeadline2}</span></h2>
        <p className="mt-4 text-muted-foreground">{t.facilitySub}</p>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="img-zoom shake-on-hover col-span-12 md:col-span-8 rounded-lg overflow-hidden" data-inview><img src={dumbbells.url} alt="Hammer Strength dumbbells" className="h-[220px] sm:h-[300px] md:h-[360px] w-full object-cover" /></div>
        <div className="img-zoom shake-on-hover col-span-12 md:col-span-4 rounded-lg overflow-hidden hover-lift" data-inview><img src={stronger.url} alt="Stronger than you think" className="h-[220px] sm:h-[300px] md:h-[360px] w-full object-cover" /></div>
        <div className="img-zoom shake-on-hover col-span-12 md:col-span-5 rounded-lg overflow-hidden hover-lift" data-inview><img src={cableMachine.url} alt="Cable machines" className="h-[220px] sm:h-[280px] md:h-[320px] w-full object-cover" /></div>
        <div className="img-zoom shake-on-hover col-span-12 sm:col-span-6 md:col-span-4 rounded-lg overflow-hidden" data-inview><img src={stayStrong.url} alt="Stay strong poster" className="h-[220px] sm:h-[280px] md:h-[320px] w-full object-cover" /></div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3 rounded-lg bg-primary text-primary-foreground p-6 flex flex-col justify-between min-h-[160px]">
          <div className="font-display text-2xl sm:text-3xl leading-none">{t.facilityCTA}</div>
          <a href="#contact" className="group inline-flex items-center gap-2 font-semibold mt-4">{t.visitUsShort} <span className={`transition-transform ${dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>{arrow}</span></a>
        </div>

      </div>

    </section>
  );
}

function Pricing({ c }: { c: SiteContent }) {
  const { t } = useI18n();
  return (
    <section id="pricing" className="relative py-16 sm:py-24 lg:py-32 border-y border-border bg-card">
      <div className="container-x">
        <div className="text-center mb-10 sm:mb-14">
          <div className="text-primary text-xs tracking-[0.3em] font-semibold">{t.pricingKicker}</div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 text-jiggle-hover" data-inview="once">{t.pricingHeadline}</h2>
          <p className="mt-3 text-muted-foreground text-sm">{t.pricingSub1} <span className="text-primary font-semibold">{t.insuranceFee}</span></p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {c.plans.map((p) => (
            <div key={p.name} className={`relative rounded-xl border p-6 sm:p-8 ${p.popular ? "border-primary bg-background neon-glow breathe" : "border-border bg-background"}`}>

              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-widest px-3 py-1 rounded">
                  {t.mostPopular}
                </div>
              )}
              <div className="font-display text-2xl tracking-wider">{p.name.toUpperCase()}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl sm:text-6xl text-primary">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.per}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-primary">✓</span> {f}</li>
                ))}
              </ul>
              <Link to="/auth" className={`mt-8 block text-center rounded-md py-3 font-semibold transition btn-shine ${p.popular ? "bg-primary text-primary-foreground btn-3d" : "border border-border hover:border-primary btn-3d-dark"}`}>
                {t.getStarted}
              </Link>
            </div>
          ))}

        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">{t.insuranceFootnote}</p>
      </div>
    </section>
  );
}

function Reviews() {
  const { t } = useI18n();
  return (
    <section className="container-x py-16 sm:py-24 lg:py-32">
      <div className="text-center mb-10 sm:mb-14">
        <div className="text-primary text-xs tracking-[0.3em] font-semibold">{t.reviewsKicker}</div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 text-jiggle-hover" data-inview="once">{t.reviewsHeadline} <span className="text-primary">★</span></h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">

        {t.reviews.map((r) => (
          <div key={r.n} className="rounded-lg border border-border bg-card p-6">
            <div className="text-primary mb-3">★★★★★</div>
            <p className="text-foreground/90">"{r.q}"</p>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="font-semibold">{r.n}</div>
              <div className="text-xs text-muted-foreground">{t.verifiedMember}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildMapSrc(q: string): string {
  const trimmed = (q || "").trim();
  // Full Google Maps embed URL pasted directly
  if (/^https?:\/\/(www\.)?google\.[^/]+\/maps\/embed/i.test(trimmed)) return trimmed;
  // Any other Google Maps URL → use as embedded query
  if (/^https?:\/\//i.test(trimmed)) {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
  }
  // "lat,lng" coordinates → drop a precise pin
  const coords = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coords) {
    return `https://www.google.com/maps?q=${coords[1]},${coords[2]}&z=17&output=embed`;
  }
  // Plain address / place name
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

function buildMapLink(q: string): string {
  const trimmed = (q || "").trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function Contact({ c }: { c: SiteContent }) {
  const { t } = useI18n();
  const mapSrc = buildMapSrc(c.mapQuery);
  return (
    <section id="contact" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden border-t border-border">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="text-primary text-xs tracking-[0.3em] font-semibold">{t.visitUs}</div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl mt-3 leading-none">
            {t.readyToStart1} <span className="text-primary">{t.readyToStart2}</span>
          </h2>
          <p className="mt-6 text-muted-foreground">{t.visitSub}</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-xl overflow-hidden border border-border bg-card h-[320px] sm:h-[400px] lg:h-[440px]">

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
            <a href={buildMapLink(c.mapQuery)} target="_blank" rel="noreferrer" className="block rounded-lg border border-border bg-card p-6 hover:border-primary transition">

              <div className="text-xs tracking-widest text-primary">{t.location}</div>
              <div className="font-display text-2xl mt-2">{c.address}</div>
              <div className="text-muted-foreground">{c.addressSub}</div>
            </a>
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary transition hover-lift">
              <div className="text-xs tracking-widest text-primary">{t.call}</div>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="block font-display text-2xl mt-2 hover:text-primary transition" dir="ltr">{c.phone}</a>
              {c.phone2 && (
                <a href={`tel:${c.phone2.replace(/\s/g, "")}`} className="block font-display text-2xl hover:text-primary transition" dir="ltr">{c.phone2}</a>
              )}
              <div className="text-muted-foreground mt-1">{t.callSub}</div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 glow-pulse">
              <div className="text-xs tracking-widest text-primary">{t.hoursLbl}</div>
              <div className="font-display text-2xl mt-2">{c.hours}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-card p-4 hover:border-primary transition hover-lift">
                <div className="text-xs tracking-widest text-primary">{t.instagramLbl}</div>
                <div className="font-display text-base mt-1 truncate" dir="ltr">@{c.instagram.replace(/^@/, "")}</div>
              </a>
              <a href={c.facebookUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-card p-4 hover:border-primary transition hover-lift">
                <div className="text-xs tracking-widest text-primary">{t.facebookLbl}</div>
                <div className="font-display text-base mt-1 truncate" dir="ltr">{c.facebook}</div>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ c }: { c: SiteContent }) {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border py-8 sm:py-10">
      <div className="container-x flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground text-center sm:text-left">

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground grid place-items-center font-display">Ω</div>
          <span>© {new Date().getFullYear()} {c.brandName} · {c.addressSub}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary" dir="ltr">@{c.instagram.replace(/^@/, "")}</a>
          <a href={c.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-primary" dir="ltr">{c.facebook}</a>
          <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-primary" dir="ltr">{c.phone}</a>
        </div>
        <div className="font-display tracking-widest">{t.footerTagline}</div>
      </div>
    </footer>
  );
}

