import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — Omega Fitness" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bot honeypot: hidden from real users, bots auto-fill it.
  const [company, setCompany] = useState("");
  const [formOpenedAt] = useState(() => Date.now());


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
      if (mode === "signup") {
        if (company.trim() !== "" || Date.now() - formOpenedAt < 2000) {
          throw new Error("Submission rejected. Please try again.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,

          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message);
    else if (!result.redirected) navigate({ to: "/account" });
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-xl">Ω</div>
          <div className="font-display tracking-wider text-xl">OMEGA FITNESS</div>
        </Link>
        <div className="rounded-xl border border-border bg-card p-8">
          <h1 className="font-display text-3xl">{mode === "signin" ? "WELCOME BACK" : "JOIN THE GYM"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to your account" : "Create your member account"}
          </p>

          <button
            onClick={google}
            className="mt-6 w-full rounded-md border border-border bg-background py-3 font-semibold hover:border-primary transition flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C33.6 6.1 29 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 8 3l5.7-5.7C33.6 6.1 29 4 24 4c-7.5 0-14 4.1-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 13-5l-6-5c-2 1.4-4.4 2.2-7 2.2-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.8 39.9 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full rounded-md bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary"
                />
                {/* Honeypot: off-screen, not display:none, so bots fill it. */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>
              </>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-md bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full rounded-md bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary"
            />
            {error && <div className="text-sm text-destructive">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary text-primary-foreground py-3 font-bold disabled:opacity-60"
            >
              {loading ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-sm text-muted-foreground hover:text-primary w-full text-center"
          >
            {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
        <Link to="/" className="block text-center text-sm text-muted-foreground mt-6 hover:text-primary">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
