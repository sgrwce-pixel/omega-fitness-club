import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Instagram, Facebook, X, ArrowRight, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import omegaLogo from "@/assets/omega-logo.jpg.asset.json";

export type NavLinkItem = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
};

type Props = {
  userTag?: string;
  isAdmin?: boolean;
  onSignOut?: () => void | Promise<void>;
  customLinks?: NavLinkItem[];
};

export default function CardNav({
  userTag,
  isAdmin = false,
  onSignOut,
  customLinks,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on Escape or click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const defaultLinks: NavLinkItem[] = [
    { label: "About", href: "/#about" },
    { label: "Programs", href: "/#programs" },
    { label: "Facility", href: "/#facility" },
    { label: "Pricing", href: "/#pricing" },
    { label: "My account", href: "/account" },
    ...(isAdmin ? [{ label: "Admin Panel", href: "/admin" }] : []),
  ];

  const links = customLinks ?? defaultLinks;

  const handleSignOut = async () => {
    setOpen(false);
    if (onSignOut) {
      await onSignOut();
    } else {
      await supabase.auth.signOut();
      navigate({ to: "/" });
    }
  };

  return (
    <>
      {/* Floating Top Navbar Header */}
      <div className="sticky top-0 z-40 w-full px-4 pt-4">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#0B0B0B]/90 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] px-4 sm:px-6 h-16 flex items-center justify-between gap-3 transition-all duration-300">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-[#8AFF3C] p-1 flex items-center justify-center shadow-[0_0_20px_-3px_rgba(138,255,60,0.45)] group-hover:scale-105 transition-transform">
              <img
                src={omegaLogo.url}
                alt="Omega Fitness"
                className="h-full w-full object-contain mix-blend-multiply"
              />
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg text-white group-hover:text-[#8AFF3C] transition-colors">
              Omega fitness
            </span>
          </Link>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {userTag && (
              <span className="hidden md:inline-flex items-center text-xs font-semibold text-[#8AFF3C] px-3 py-1 rounded-full bg-[#8AFF3C]/10 border border-[#8AFF3C]/25">
                {userTag}
              </span>
            )}
            
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex text-xs rounded-xl border border-white/10 px-3.5 py-2 font-semibold text-white/90 hover:border-[#8AFF3C] hover:text-[#8AFF3C] transition"
              >
                Admin
              </Link>
            )}

            <Link
              to="/account"
              className="hidden sm:inline-flex text-xs rounded-xl border border-white/10 px-3.5 py-2 font-semibold text-white/90 hover:border-[#8AFF3C] hover:text-[#8AFF3C] transition"
            >
              My account
            </Link>

            {/* Menu Trigger Button */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 text-white transition hover:border-[#8AFF3C]"
            >
              <Menu className="w-4 h-4 text-[#8AFF3C]" />
              <span className="text-xs font-bold tracking-wider uppercase">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Popup Card Overlay (Matching Reference Image) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-all duration-200">
          <div
            ref={menuRef}
            className="w-full max-w-sm rounded-3xl bg-[#0B0B0B] border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between"
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px -10px rgba(138, 255, 60, 0.15)",
            }}
          >
            {/* Card Header: Green Icon + Brand + Close 'X' */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#8AFF3C] p-1 flex items-center justify-center shadow-[0_0_20px_-3px_rgba(138,255,60,0.5)]">
                  <img
                    src={omegaLogo.url}
                    alt="Omega Fitness"
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">
                  Omega fitness
                </span>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Link Items with Right Arrows & Divider lines */}
            <nav className="divide-y divide-white/10 my-2">
              {links.map((link) => (
                <div key={link.label}>
                  {link.onClick ? (
                    <button
                      type="button"
                      onClick={async () => {
                        setOpen(false);
                        await link.onClick!();
                      }}
                      className="w-full flex items-center justify-between py-4 text-left font-bold text-lg text-white hover:text-[#8AFF3C] transition-colors group"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#8AFF3C] group-hover:translate-x-1 transition-all" />
                    </button>
                  ) : (
                    <a
                      href={link.href ?? "#"}
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center justify-between py-4 font-bold text-lg text-white hover:text-[#8AFF3C] transition-colors group"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#8AFF3C] group-hover:translate-x-1 transition-all" />
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Bottom Footer Section: Social Icons + Big Green Button */}
            <div className="pt-3">
              {/* Green Contact & Social Icons */}
              <div className="flex items-center gap-5 py-3 text-[#8AFF3C]">
                <a
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  aria-label="Contact us"
                  className="hover:scale-110 transition-transform"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/club.omegafit"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="hover:scale-110 transition-transform"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/club.omegafit"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="hover:scale-110 transition-transform"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>

              {/* Big Neon Green Action Button */}
              {onSignOut ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full mt-2 rounded-2xl bg-[#8AFF3C] hover:bg-[#7BE832] text-black font-bold text-base py-3.5 text-center shadow-[0_0_25px_-5px_rgba(138,255,60,0.4)] transition-all active:scale-[0.99]"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="w-full mt-2 block rounded-2xl bg-[#8AFF3C] hover:bg-[#7BE832] text-black font-bold text-base py-3.5 text-center shadow-[0_0_25px_-5px_rgba(138,255,60,0.4)] transition-all active:scale-[0.99]"
                >
                  Sign in
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
