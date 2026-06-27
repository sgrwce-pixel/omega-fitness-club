import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import CardNav, { type CardNavItem } from "@/components/CardNav";

const navItems: CardNavItem[] = [
  {
    label: "Train",
    bgColor: "#1B1722",
    textColor: "#fff",
    links: [
      { label: "About", href: "/#about", ariaLabel: "About Omega Fitness" },
      { label: "Programs", href: "/#programs", ariaLabel: "Our Programs" },
      { label: "Facility", href: "/#facility", ariaLabel: "Tour the Facility" },
    ],
  },
  {
    label: "Membership",
    bgColor: "#2F293A",
    textColor: "#fff",
    links: [
      { label: "Pricing", href: "/#pricing", ariaLabel: "Membership Pricing" },
      { label: "My Account", href: "/account", ariaLabel: "My Account" },
    ],
  },
  {
    label: "Connect",
    bgColor: "#8AFF3C",
    textColor: "#0a0a0a",
    links: [
      { label: "Contact", href: "/#contact", ariaLabel: "Contact Us" },
      { label: "Instagram", href: "https://instagram.com/club.omegafit", ariaLabel: "Instagram" },
      { label: "Facebook", href: "https://facebook.com/club.omegafit", ariaLabel: "Facebook" },
    ],
  },
];

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <CardNav
        items={navItems}
        baseColor="#ffffff"
        menuColor="#0a0a0a"
        buttonBgColor="#0a0a0a"
        buttonTextColor="#ffffff"
        theme="light"
      />
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});
