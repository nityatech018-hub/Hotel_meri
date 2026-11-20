
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHotel } from "@/lib/hotel/store";
import { cn } from "@/lib/utils";

import { Logo } from "./Logo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/rooms", label: "Rooms & Suites" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const session = useHotel((state) => state.session);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const account =
    session?.role === "reception" ? (
      <Link to="/reception" className="flex items-center gap-2">
        <UserRound className="size-4" />
        Reception
      </Link>
    ) : session ? (
      <Link to="/account" className="flex items-center gap-2">
        <UserRound className="size-4" />
        My Account
      </Link>
    ) : (
      <Link
        to="/login"
        search={{}}
        className="flex items-center gap-2"
      >
        <UserRound className="size-4" />
        Login
      </Link>
    );

  return (
    <motion.header
      initial={{
        y: -40,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold/25 bg-navy/95 shadow-lift backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-5 transition-all lg:px-8",
          scrolled ? "h-16" : "h-24",
        )}
      >
        {/* Website Logo */}
        <Link
          to="/"
          aria-label="Hotel Meri & Residency home"
          className="transition-transform duration-500 hover:scale-[1.03]"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{
                exact: link.to === "/",
              }}
              className="group relative text-[0.8rem] tracking-[0.16em] text-navy-foreground/80 uppercase transition-colors hover:text-champagne data-[status=active]:text-champagne"
            >
              {link.label}

              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full group-data-[status=active]:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop Account and Booking */}
        <div className="hidden items-center gap-5 lg:flex">
          <span className="text-[0.8rem] tracking-[0.12em] text-navy-foreground/80 uppercase hover:text-champagne">
            {account}
          </span>

          <Button
            asChild
            variant="gold"
            size="xl"
            className="h-10"
          >
            <Link to="/book" search={{}}>
              Book Now
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-full border border-gold/40 p-2 text-champagne lg:hidden"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="overflow-hidden border-t border-gold/20 bg-navy lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {LINKS.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.05 + index * 0.05,
                  }}
                >
                  <Link
                    to={link.to}
                    activeOptions={{
                      exact: link.to === "/",
                    }}
                    className="block rounded-lg px-3 py-3 font-display text-xl text-navy-foreground data-[status=active]:text-gold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="px-3 py-3 text-sm tracking-[0.12em] text-champagne uppercase">
                {account}
              </div>

              <Button
                asChild
                variant="gold"
                size="xl"
                className="mt-2"
              >
                <Link to="/book" search={{}}>
                  Book Now
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
