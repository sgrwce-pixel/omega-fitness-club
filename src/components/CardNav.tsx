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

  // Split items: first group is main nav (flat rows), last group is social (icon row)
  const mainNavLinks: CardNavLink[] = [];
  const socialLinks: CardNavLink[] = [];

  items.forEach((it, i) => {
    if (i === items.length - 1 && it.links.some((l) => l.icon)) {
      // Last item with icons → social links at bottom
      it.links.forEach((l) => socialLinks.push(l));
    } else {
      it.links.forEach((l) => mainNavLinks.push(l));
    }
  });

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
                className="w-full h-full object-contain"
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

        {/* Mobile nav panel — flat list with dividers */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="p-2">
              {/* Main nav links as flat rows */}
              {mainNavLinks.map((link, i) => (
                <div key={link.label} className={i < mainNavLinks.length - 1 ? "border-b border-white/10" : ""}>
                  <NavRow link={link} />
                </div>
              ))}

              {/* Social links as icon row at the bottom */}
              {socialLinks.length > 0 && (
                <div className="mt-1 pt-2 border-t border-white/10 flex items-center justify-center gap-6 px-4 py-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href ?? "#"}
                      aria-label={link.ariaLabel ?? link.label}
                      className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition"
                    >
                      {link.icon && <span className="text-primary text-base leading-none">{link.icon}</span>}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavRow({ link }: { link: CardNavLink }) {
  const handleClick = async (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      await link.onClick();
    }
  };

  const isSignOut = link.label === "Sign out" || link.ariaLabel === "Sign out";

  if (link.onClick && !link.href) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={link.ariaLabel ?? link.label}
        className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-semibold transition ${
          isSignOut
            ? "bg-primary text-primary-foreground rounded-md mx-2 my-1"
            : "text-foreground hover:text-primary"
        }`}
      >
        <span className="flex items-center gap-3">
          {link.icon && <span className="text-primary text-base leading-none">{link.icon}</span>}
          <span>{link.label}</span>
        </span>
        <span className="text-primary transition-transform group-hover:translate-x-1">→</span>
      </button>
    );
  }

  return (
    <a
      href={link.href ?? "#"}
      onClick={handleClick}
      aria-label={link.ariaLabel ?? link.label}
      className="group flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-foreground hover:text-primary transition"
    >
      <span className="flex items-center gap-3">
        {link.icon && <span className="text-primary text-base leading-none">{link.icon}</span>}
        <span>{link.label}</span>
      </span>
      <span className="text-primary transition-transform group-hover:translate-x-1">→</span>
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
