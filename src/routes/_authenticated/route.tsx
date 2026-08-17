import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CardNav, { type CardNavItem } from "@/components/CardNav";

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [userTag, setUserTag] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const rawUsername =
          (data.user.user_metadata?.username as string | undefined) ||
          data.user.email?.replace(/@omega\.internal$/i, "") ||
          "";
        if (rawUsername) {
          setUserTag(rawUsername.replace(/^@/, ""));
        }

        if (data.user.id) {
          const { data: role } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .eq("role", "admin")
            .maybeSingle();
          setIsAdmin(!!role);
        }
      }
    });
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
        ...(isAdmin ? [{ label: "Admin Panel", href: "/admin", ariaLabel: "Admin Panel" }] : []),
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
      <CardNav items={navItems} userTag={userTag} isAdmin={isAdmin} onSignOut={signOut} />
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
