import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usernameToEmail } from "@/lib/username";
import omegaLogo from "@/assets/omega-logo.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Member Sign In — Omega Fitness Club" },
      { name: "description", content: "Sign in to your Omega Fitness Club member account to view your membership and plan." },
      { property: "og:title", content: "Member Sign In — Omega Fitness Club" },
      { property: "og:description", content: "Members-only sign in for Omega Fitness Club. Accounts are created at the gym by our staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });
      if (signInError) {
        setError(
          signInError.message?.toLowerCase().includes("invalid login")
            ? "Incorrect username or password."
            : signInError.message || "Could not sign you in. Please try again.",
        );
        return;
      }
      navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-10 w-10 rounded-xl border border-primary/20 bg-card p-1 shadow-[0_0_20px_-5px_rgba(132,204,22,0.35)] flex items-center justify-center">
            <img src={omegaLogo.url} alt="Omega Fitness Club logo" className="h-full w-full object-contain" />
          </div>
          <div className="font-display tracking-wider text-xl">OMEGA FITNESS</div>
        </Link>
        <div className="rounded-xl border border-border bg-card p-8">
          <h1 className="font-display text-3xl">WELCOME BACK</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your member account</p>

          <form onSubmit={submit} className="space-y-3 mt-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
              placeholder="Username"
              required
              autoCapitalize="none"
              autoComplete="username"
              className="w-full rounded-md bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              autoComplete="current-password"
              className="w-full rounded-md bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary"
            />
            {error && <div className="text-sm text-destructive">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary text-primary-foreground py-3 font-bold disabled:opacity-60"
            >
              {loading ? "..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-md border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            Member accounts are created by our staff at the gym. Visit us or message us and we'll set up your
            account and hand you your login details.
          </div>
        </div>
        <Link to="/" className="block text-center text-sm text-muted-foreground mt-6 hover:text-primary">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
