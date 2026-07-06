import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import AmbientBackground from "../components/AmbientBackground";
import { I18nProvider } from "../lib/i18n";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index, follow" },
      { title: "Omega Fitness Club — Gym in Beni Khiar, Tunisia | Strength, Cardio & Coaching" },
      { name: "description", content: "Omega Fitness Club in Beni Khiar, Tunisia: premium strength & cardio equipment, expert coaching, group classes and personal training. Open daily until 11pm." },
      { property: "og:title", content: "Omega Fitness Club — Gym in Beni Khiar, Tunisia | Strength, Cardio & Coaching" },
      { property: "og:description", content: "Omega Fitness Club in Beni Khiar, Tunisia: premium strength & cardio equipment, expert coaching, group classes and personal training. Open daily until 11pm." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://omega-fitness-club.lovable.app" },
      { property: "og:site_name", content: "Omega Fitness Club" },
      { property: "og:image", content: "https://omega-fitness-club.lovable.app/__l5e/assets-v1/696b9951-eebc-4aae-a970-3759d5ca3373/og-cover.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Omega Fitness Club — Beni Khiar, Tunisia" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://omega-fitness-club.lovable.app" },
      { name: "twitter:title", content: "Omega Fitness Club — Gym in Beni Khiar, Tunisia | Strength, Cardio & Coaching" },
      { name: "twitter:description", content: "Omega Fitness Club in Beni Khiar, Tunisia: premium strength & cardio equipment, expert coaching, group classes and personal training. Open daily until 11pm." },
      { name: "twitter:image", content: "https://omega-fitness-club.lovable.app/__l5e/assets-v1/696b9951-eebc-4aae-a970-3759d5ca3373/og-cover.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://omega-fitness-club.lovable.app" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HealthClub",
          name: "Omega Fitness",
          description: "Premium gym in Beni Khiar, Tunisia offering strength training, cardio, group classes and personal coaching.",
          url: "https://omega-fitness-club.lovable.app",
          telephone: "+216 20 084 304",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Avenue Habib Bourguiba",
            addressLocality: "Beni Khiar",
            addressRegion: "Nabeul",
            addressCountry: "TN",
          },
          openingHoursSpecification: [{
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            opens: "06:00",
            closes: "23:00",
          }],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow" />
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="ktXR7RiXPA5UizTvkLVYBFC5BxkyVD_u0eK4a4WEun0" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AmbientBackground />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </I18nProvider>
    </QueryClientProvider>

  );
}
