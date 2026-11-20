import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LogOut, Menu, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/site/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatDate, todayISO } from "@/lib/hotel/pricing";
import { logout, useHotel } from "@/lib/hotel/store";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Rendered link — keeps route typing in the layout file that owns the paths. */
  link: (props: {
    className: string;
    children: ReactNode;
    onClick?: (() => void) | undefined;
  }) => ReactNode;
  exact?: boolean;
}

type Variant = "reception" | "guest";

function isActive(pathname: string, item: NavItem) {
  const p = pathname.replace(/\/$/, "");
  return item.exact ? p === item.to : p === item.to || p.startsWith(item.to + "/");
}

function SideNav({
  items,
  variant,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  variant: Variant;
  pathname: string;
  onNavigate?: (() => void) | undefined;
}) {
  const navigate = useNavigate();
  const dark = variant === "reception";
  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-3 px-6 pt-7 pb-6" onClick={onNavigate}>
        <motion.span
          initial={{ rotate: -120, scale: 0.4 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 14 }}
        >
          <LogoMark className="size-11" />
        </motion.span>
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-base font-semibold tracking-[0.18em]",
              dark ? "text-navy-foreground" : "text-navy",
            )}
          >
            HOTEL MERI
          </span>
          <span className="mt-1 text-[0.55rem] tracking-[0.4em] text-gold">
            {dark ? "RECEPTION DESK" : "GUEST LOUNGE"}
          </span>
        </span>
      </Link>
      <div className={cn("mx-6 h-px", dark ? "bg-gold/25" : "bg-border")} />
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {items.map((item, i) => {
          const active = isActive(pathname, item);
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.035, duration: 0.4 }}
            >
              {item.link({
                onClick: onNavigate,
                className: cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                  dark
                    ? active
                      ? "text-navy"
                      : "text-sidebar-foreground/75 hover:text-champagne"
                    : active
                      ? "text-navy"
                      : "text-muted-foreground hover:text-navy",
                ),
                children: (
                  <>
                    {active && (
                      <motion.span
                        layoutId={`nav-pill-${variant}`}
                        className={cn(
                          "absolute inset-0 rounded-xl",
                          dark
                            ? "bg-gold-gradient shadow-gold"
                            : "bg-accent shadow-card ring-1 ring-gold/40",
                        )}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "relative size-4 transition-transform group-hover:scale-110",
                        !active && "text-gold",
                      )}
                    />
                    <span className="relative font-medium tracking-wide">{item.label}</span>
                  </>
                ),
              })}
            </motion.div>
          );
        })}
      </nav>
      <div className={cn("space-y-1 border-t p-3", dark ? "border-gold/20" : "border-border")}>
        <Link
          to="/"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition",
            dark
              ? "text-sidebar-foreground/75 hover:text-champagne"
              : "text-muted-foreground hover:text-navy",
          )}
        >
          <Home className="size-4 text-gold" /> Visit website
        </Link>
        <button
          onClick={() => {
            logout();
            onNavigate?.();
            navigate({ to: "/login", search: { role: variant } });
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition",
            dark
              ? "text-sidebar-foreground/75 hover:bg-destructive/20 hover:text-navy-foreground"
              : "text-muted-foreground hover:bg-danger-soft hover:text-destructive",
          )}
        >
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({
  items,
  variant,
  children,
  action,
}: {
  items: NavItem[];
  variant: Variant;
  children: ReactNode;
  action?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useHotel((s) => s.session);
  const [open, setOpen] = useState(false);
  const current = items.find((i) => isActive(pathname, i)) ?? items[0]!;
  const dark = variant === "reception";

  return (
    <div className="bg-dashboard min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-72 lg:block",
          dark ? "bg-navy-gradient text-sidebar-foreground" : "border-r border-border bg-card",
        )}
      >
        <SideNav items={items} variant={variant} pathname={pathname} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className={cn(
            "w-72 p-0",
            dark ? "border-gold/20 bg-navy text-sidebar-foreground" : "bg-card",
          )}
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SideNav
            items={items}
            variant={variant}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <header className="glass-light sticky top-0 z-30 border-x-0 border-t-0">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-border p-2 text-navy lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={current.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="truncate font-display text-2xl text-navy md:text-3xl"
                >
                  {current.label}
                </motion.h1>
              </AnimatePresence>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {formatDate(todayISO(), {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {action}
            <div className="flex items-center gap-3 rounded-full border border-border bg-card py-1 pr-4 pl-1">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full font-display text-sm",
                  dark ? "bg-navy text-gold" : "bg-gold-gradient text-gold-foreground",
                )}
              >
                {session?.name.slice(0, 1) ?? "?"}
              </span>
              <span className="hidden text-sm sm:block">
                <span className="block leading-none font-medium text-navy">{session?.name}</span>
                <span className="text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  {dark ? "Receptionist" : "Guest"}
                </span>
              </span>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          {/* No exit animation: the outlet already shows the next page while leaving. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
        <p className="px-8 pb-6 text-center text-[0.7rem] text-muted-foreground">
          Demo dashboard — data is stored only in this browser. Sign-in here is for demonstration,
          not real security.
        </p>
      </div>
    </div>
  );
}

/** Full-screen royal loader shown while the demo session is read from the browser. */
export function ShellLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-deep">
      <div className="relative grid size-28 place-items-center">
        <span className="animate-spin-slow absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold/40" />
        <LogoMark className="size-20" />
      </div>
    </div>
  );
}
