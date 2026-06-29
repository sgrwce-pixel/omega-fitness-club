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
      { title: "Omega Fitness — Gym in Beni Khiar, Tunisia | Strength, Cardio & Coaching" },
      { name: "description", content: "Omega Fitness in Beni Khiar, Tunisia: premium strength & cardio equipment, expert coaching, group classes and personal training. Open daily until 11pm." },
      { property: "og:title", content: "Omega Fitness — Gym in Beni Khiar, Tunisia | Strength, Cardio & Coaching" },
      { property: "og:description", content: "Omega Fitness in Beni Khiar, Tunisia: premium strength & cardio equipment, expert coaching, group classes and personal training. Open daily until 11pm." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://omega-fitness-club.lovable.app" },
      { property: "og:site_name", content: "Omega Fitness" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Omega Fitness — Gym in Beni Khiar, Tunisia | Strength, Cardio & Coaching" },
      { name: "twitter:description", content: "Omega Fitness in Beni Khiar, Tunisia: premium strength & cardio equipment, expert coaching, group classes and personal training. Open daily until 11pm." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6765605c-cc32-4596-9ef0-897665cc6032/id-preview-ada3445f--e2b0b90e-5a8b-4a9b-97d2-ef885dfcb0a9.lovable.app-1782474475373.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6765605c-cc32-4596-9ef0-897665cc6032/id-preview-ada3445f--e2b0b90e-5a8b-4a9b-97d2-ef885dfcb0a9.lovable.app-1782474475373.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
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
      <AmbientBackground />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>

  );
}
