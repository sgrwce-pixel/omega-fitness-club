import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CardNav, { type CardNavItem } from "@/components/CardNav";

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

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
        { label: "Sign out", onClick: signOut, ariaLabel: "Sign out" },
      ],
    },
    {
      label: "Connect",
      bgColor: "#8AFF3C",
      textColor: "#0a0a0a",
      links: [
        { label: "Contact", href: "/#contact", ariaLabel: "Contact Us", icon: "✉" },
        {
          label: "Instagram",
          href: "https://instagram.com/club.omegafit",
          ariaLabel: "Instagram",
          icon: "◉",
        },
        {
          label: "Facebook",
          href: "https://facebook.com/club.omegafit",
          ariaLabel: "Facebook",
          icon: "f",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CardNav items={navItems} userEmail={email} />
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
