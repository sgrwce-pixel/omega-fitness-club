import { useState } from "react";

export type CardNavLink = { label: string; href: string; ariaLabel?: string };
export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

type Props = {
  logo?: string;
  logoAlt?: string;
  items: CardNavItem[];
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: "light" | "dark";
};

export default function CardNav({
  logo,
  logoAlt = "Logo",
  items,
  baseColor = "#fff",
  menuColor = "#000",
  buttonBgColor = "#111",
  buttonTextColor = "#fff",
  ctaLabel = "Back to site",
  ctaHref = "/",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4">
      <div
        className="mx-auto max-w-6xl rounded-2xl shadow-lg border border-black/5 overflow-hidden transition-all duration-500 ease-out"
        style={{ background: baseColor, color: menuColor }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 h-16">
          <a href="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={logoAlt} className="h-7 w-7" />
            ) : (
              <span className="font-display text-xl">Ω</span>
            )}
            <span className="font-semibold tracking-wide text-sm">OMEGA FITNESS</span>
          </a>

          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-black/5 transition"
            style={{ color: menuColor }}
          >
            <span
              className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : "-translate-y-1"}`}
            />
            <span
              className={`block w-5 h-0.5 bg-current absolute transition-transform duration-300 ${open ? "-translate-y-0 -rotate-45" : "translate-y-1"}`}
            />
          </button>

          <a
            href={ctaHref}
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition hover:opacity-90"
            style={{ background: buttonBgColor, color: buttonTextColor }}
          >
            {ctaLabel} →
          </a>
        </div>

        {/* Expanding card panel */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {items.map((it, i) => (
                <div
                  key={it.label}
                  className="rounded-xl p-5 transition-all duration-500 ease-out"
                  style={{
                    background: it.bgColor,
                    color: it.textColor,
                    transform: open ? "translateY(0)" : "translateY(20px)",
                    opacity: open ? 1 : 0,
                    transitionDelay: open ? `${i * 80}ms` : "0ms",
                  }}
                >
                  <div className="text-xs tracking-[0.25em] opacity-70">0{i + 1}</div>
                  <div className="font-display text-2xl mt-2">{it.label}</div>
                  <ul className="mt-4 space-y-2">
                    {it.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          aria-label={l.ariaLabel ?? l.label}
                          className="inline-flex items-center gap-2 text-sm hover:translate-x-1 transition-transform"
                        >
                          <span>→</span>
                          <span className="underline-offset-4 hover:underline">{l.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
