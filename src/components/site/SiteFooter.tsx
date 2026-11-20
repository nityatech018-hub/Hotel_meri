import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { useHotel } from "@/lib/hotel/store";
import { Logo } from "./Logo";

export function SiteFooter() {
  const settings = useHotel((s) => s.settings);
  return (
    <footer className="relative overflow-hidden bg-navy-deep text-navy-foreground">
      <div className="h-px w-full bg-gold-gradient" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-navy-foreground/60">
            Royal comfort, heartfelt hospitality and unforgettable stays — welcome home to Hotel
            Meri &amp; Residency.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social media"
                className="grid size-10 place-items-center rounded-full border border-gold/30 text-champagne transition hover:-translate-y-0.5 hover:bg-gold hover:text-gold-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="eyebrow text-gold">Quick links</h4>
          <ul className="mt-5 space-y-3 text-sm text-navy-foreground/70">
            <li>
              <Link to="/about" className="hover:text-champagne">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/rooms" className="hover:text-champagne">
                Rooms &amp; Suites
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-champagne">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-champagne">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/book" search={{}} className="hover:text-champagne">
                Book a Room
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold">Guests &amp; Staff</h4>
          <ul className="mt-5 space-y-3 text-sm text-navy-foreground/70">
            <li>
              <Link to="/login" search={{ role: "guest" }} className="hover:text-champagne">
                Guest Login
              </Link>
            </li>
            <li>
              <Link to="/login" search={{ role: "reception" }} className="hover:text-champagne">
                Reception Login
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-champagne">
                My Bookings
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold">Contact</h4>
          <ul className="mt-5 space-y-4 text-sm text-navy-foreground/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              {settings.address}
            </li>
            <li className="flex gap-3">
              <Phone className="size-4 shrink-0 text-gold" />
              {settings.phone}
            </li>
            <li className="flex gap-3">
              <Mail className="size-4 shrink-0 text-gold" />
              {settings.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-navy-foreground/50 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Hotel Meri &amp; Residency. All rights reserved.</p>
          <p>Demo website — prices, contacts and accounts shown are sample data.</p>
        </div>
      </div>
    </footer>
  );
}
