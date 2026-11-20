import { createFileRoute, Link, useHydrated } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Printer } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR, nightsBetween } from "@/lib/hotel/pricing";
import { getCategory, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/invoice/$bookingId")({
  head: () => ({
    meta: [
      { title: "Booking Invoice — Hotel Meri & Residency" },
      { name: "description", content: "Booking confirmation and invoice." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Booking Invoice — Hotel Meri & Residency" },
      { property: "og:description", content: "Booking confirmation and invoice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Invoice,
});

function Invoice() {
  const { bookingId } = Route.useParams();
  const hydrated = useHydrated();
  const state = useHotelState();
  const b = state.bookings.find((x) => x.id === bookingId);
  const back =
    state.session?.role === "reception"
      ? "/reception/bookings"
      : state.session
        ? "/account/bookings"
        : "/";

  if (!hydrated) return <div className="min-h-screen bg-muted" />;
  if (!b)
    return (
      <div className="grid min-h-screen place-items-center bg-muted p-6 text-center">
        <div>
          <h1 className="text-4xl text-navy">Booking not found</h1>
          <p className="mt-2 text-muted-foreground">
            We couldn't find booking {bookingId} on this device.
          </p>
          <Button asChild variant="navy" className="mt-6">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  const cat = getCategory(state, b.categoryId);
  const nights = nightsBetween(b.checkIn, b.checkOut);
  const subtotal = cat.price * nights * b.rooms;
  const tax = b.total - subtotal;

  return (
    <div className="min-h-screen bg-muted px-4 py-10 print:bg-card print:p-0">
      <div className="mx-auto mb-6 flex max-w-3xl justify-between print:hidden">
        <Button asChild variant="ghost">
          <Link to={back}>
            <ArrowLeft /> Back
          </Link>
        </Button>
        <Button variant="gold" onClick={() => window.print()}>
          <Printer /> Download / Print
        </Button>
      </div>
      <motion.article
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-card shadow-lift print:shadow-none"
      >
        <header className="flex items-center justify-between bg-navy p-8 text-navy-foreground">
          <div className="flex items-center gap-4">
            <LogoMark className="size-16" />
            <div>
              <p className="font-display text-2xl tracking-[0.12em]">HOTEL MERI &amp; RESIDENCY</p>
              <p className="text-xs text-navy-foreground/60">{state.settings.address}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="eyebrow text-gold">Invoice</p>
            <p className="font-display text-2xl">{b.id}</p>
          </div>
        </header>
        <div className="h-1 bg-gold-gradient" />
        <div className="grid gap-6 p-8 sm:grid-cols-2">
          <div>
            <p className="eyebrow text-gold">Billed to</p>
            <p className="mt-2 text-lg text-navy">{b.guestName}</p>
            <p className="text-sm text-muted-foreground">{b.email}</p>
            <p className="text-sm text-muted-foreground">{b.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="eyebrow text-gold">Details</p>
            <p className="mt-2 text-sm text-muted-foreground">Issued {formatDate(b.createdAt)}</p>
            <div className="mt-2 flex gap-2 sm:justify-end">
              <StatusBadge status={b.status} />
              <PaymentBadge status={b.payment} />
            </div>
            {b.roomNumber && <p className="mt-2 text-sm text-navy">Room {b.roomNumber}</p>}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-8 py-3">Description</th>
              <th className="px-4 py-3">Nights</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-8 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-8 py-4 text-navy">
                {cat.name} × {b.rooms}
                <span className="block text-xs text-muted-foreground">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.guests} guests
                </span>
              </td>
              <td className="px-4 py-4">{nights}</td>
              <td className="px-4 py-4">{formatINR(cat.price)}</td>
              <td className="px-8 py-4 text-right">{formatINR(subtotal)}</td>
            </tr>
          </tbody>
        </table>
        <div className="ml-auto max-w-xs space-y-2 p-8 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes</span>
            <span>{formatINR(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-display text-xl text-navy">
            <span>Total</span>
            <span>{formatINR(b.total)}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Paid</span>
            <span>{formatINR(b.amountPaid)}</span>
          </div>
          <div className="flex justify-between font-medium text-navy">
            <span>Balance due</span>
            <span>{formatINR(Math.max(0, b.total - b.amountPaid))}</span>
          </div>
        </div>
        <footer className="border-t border-border p-8 text-center text-xs text-muted-foreground">
          Thank you for choosing Hotel Meri &amp; Residency. This is a demo invoice with sample
          prices.
        </footer>
      </motion.article>
    </div>
  );
}
