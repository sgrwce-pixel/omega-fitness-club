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

  return (
    <div className="min-h-screen bg-background">
      <CardNav userTag={userTag} isAdmin={isAdmin} onSignOut={signOut} />
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
