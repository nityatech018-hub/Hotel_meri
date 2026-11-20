import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";

import { Intro } from "@/components/site/Intro";
import { LOGO_URL } from "@/components/site/Logo";

import { CursorGlow, PageTransition, RouteCurtain, RouteProgress } from "@/components/site/Motion";

import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// --------------------------------------------------
// 404 Page
// --------------------------------------------------

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h1 className="text-gold-gradient animate-shine font-display text-8xl">404</h1>

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
      </motion.div>
    </div>
  );
}

// --------------------------------------------------
// Error Page
// --------------------------------------------------

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
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

// --------------------------------------------------
// Root Route
// --------------------------------------------------

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Hotel Meri & Residency — Royal Comfort & Hospitality",
      },
      {
        name: "description",
        content: "Luxury rooms and suites with warm Indian hospitality at Hotel Meri & Residency.",
      },
      {
        name: "author",
        content: "Hotel Meri & Residency",
      },
      {
        property: "og:title",
        content: "Hotel Meri & Residency",
      },
      {
        property: "og:description",
        content: "Luxury rooms and suites with warm Indian hospitality.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],

    links: [
      // Main CSS
      {
        rel: "stylesheet",
        href: appCss,
      },

      // Browser Favicon
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png?v=4",
      },

      // Apple Touch Icon
      {
        rel: "apple-touch-icon",
        sizes: "256x256",
        href: "/favicon.png?v=4",
      },

      // Google Fonts
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// --------------------------------------------------
// Root HTML Shell
// --------------------------------------------------

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// --------------------------------------------------
// Root Application Component
// --------------------------------------------------

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const top = pathname.split("/")[1] ?? "";

  const section = top === "account" || top === "reception" ? top : pathname;

  return (
    <QueryClientProvider client={queryClient}>
      {/* Route Loading Progress */}
      <RouteProgress />

      {/* Cinematic Entrance Animation */}
      {top !== "invoice" && <Intro />}

      {/* Page Transition with Shared Hotel Logo */}
      <RouteCurtain section={section} logo={LOGO_URL} />

      {/* Cursor Animation */}
      <CursorGlow />

      {/* Page Content */}
      <PageTransition id={section}>
        <Outlet />
      </PageTransition>

      {/* Notifications */}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
