import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import omegaLogo from "@/assets/omega-logo.jpg.asset.json";

export type CardNavLink = {
  label: string;
  href?: string;
  ariaLabel?: string;
  icon?: string;
  onClick?: () => void | Promise<void>;
};
export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

type Props = {
  items: CardNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  userTag?: string;
  isAdmin?: boolean;
  onSignOut?: () => void | Promise<void>;
};

export default function CardNav({
  items,
  ctaLabel = "Back to site",
  ctaHref = "/",
  userTag,
  isAdmin = false,
  onSignOut,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4">
      <div
        ref={ref}
        className="mx-auto max-w-6xl rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ease-out"
      >
        {/* Unified Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 h-16 gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-xl border border-primary/20 bg-card p-1 shadow-[0_0_20px_-5px_rgba(132,204,22,0.35)] flex items-center justify-center shrink-0">
              <img
                src={omegaLogo.url}
                alt="Omega Fitness logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display tracking-wider text-base text-foreground truncate">
                OMEGA FITNESS
              </div>
              {isAdmin && (
                <div className="text-[10px] tracking-widest text-primary font-semibold">
                  ADMIN
                </div>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {userTag && (
              <span className="hidden md:inline-flex items-center text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25">
                {userTag}
              </span>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs rounded-md border border-border px-3 py-1.5 font-semibold hover:border-primary transition"
              >
                Admin
              </Link>
            )}
            <Link
              to="/account"
              className="text-xs rounded-md border border-border px-3 py-1.5 font-semibold hover:border-primary transition"
            >
              Account
            </Link>
            {onSignOut ? (
              <button
                onClick={onSignOut}
                className="text-xs rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-semibold hover:opacity-90 transition"
              >
                Sign out
              </button>
            ) : (
              <a
                href={ctaHref}
                className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary transition"
              >
                {ctaLabel}
              </a>
            )}
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative w-9 h-9 grid place-items-center rounded-lg text-foreground hover:bg-white/10 transition border border-border shrink-0"
            >
              <span
                className={`block w-4 h-0.5 bg-current absolute transition-transform duration-300 ${
                  open ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`block w-4 h-0.5 bg-current absolute transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block w-4 h-0.5 bg-current absolute transition-transform duration-300 ${
                  open ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </div>
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
                  className="group/card rounded-xl p-5 border-l-2 border-transparent hover:border-primary/30 transition-all duration-500 ease-out"
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
                        <CardLink link={l} />
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

function CardLink({ link }: { link: CardNavLink }) {
  const navigate = useNavigate();
  const handleClick = async (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      await link.onClick();
    }
  };

  const content = (
    <>
      {link.icon && <span className="text-base leading-none">{link.icon}</span>}
      <span className="underline-offset-4 group-hover:underline flex-1">{link.label}</span>
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </>
  );

  if (link.onClick && !link.href) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={link.ariaLabel ?? link.label}
        className="group inline-flex items-center gap-2 text-sm w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={link.href ?? "#"}
      onClick={handleClick}
      aria-label={link.ariaLabel ?? link.label}
      className="group inline-flex items-center gap-2 text-sm"
    >
      {content}
    </a>
  );
}

export function useSignOut() {
  const navigate = useNavigate();
  return async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };
}
