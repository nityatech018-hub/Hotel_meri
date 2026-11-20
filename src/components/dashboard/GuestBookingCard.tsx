import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BedDouble, CalendarDays, FileText, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  canGuestCancel,
  formatDate,
  formatINR,
  nightsBetween,
  parseISODate,
  todayISO,
} from "@/lib/hotel/pricing";
import { getCategory, setBookingStatus, useHotelState } from "@/lib/hotel/store";
import type { Booking } from "@/lib/hotel/types";

export function daysUntil(iso: string) {
  return Math.round(
    (parseISODate(iso).getTime() - parseISODate(todayISO()).getTime()) / 86_400_000,
  );
}

export function GuestBookingCard({ booking, index = 0 }: { booking: Booking; index?: number }) {
  const state = useHotelState();
  const cat = getCategory(state, booking.categoryId);
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const cancellable = canGuestCancel(booking);
  const d = daysUntil(booking.checkIn);
  const open = booking.status === "Pending" || booking.status === "Confirmed";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift sm:flex-row"
    >
      <div className="relative sm:w-56">
        <img
          src={cat.image}
          alt={cat.name}
          className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-full"
        />
        {open && d >= 0 && (
          <span className="glass-navy absolute top-3 left-3 rounded-full px-3 py-1 text-[0.65rem] tracking-wider text-champagne uppercase">
            {d === 0 ? "Today" : `In ${d} day${d > 1 ? "s" : ""}`}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs tracking-wider text-gold uppercase">{booking.id}</p>
            <h3 className="font-display text-2xl text-navy">{cat.name}</h3>
          </div>
          <div className="flex gap-1.5">
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.payment} />
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-gold" />{" "}
            {formatDate(booking.checkIn, { day: "numeric", month: "short" })} →{" "}
            {formatDate(booking.checkOut, { day: "numeric", month: "short" })}
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-gold" /> {nights} night{nights > 1 ? "s" : ""} ·{" "}
            {booking.rooms} room{booking.rooms > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-gold" /> {booking.guests} guest
            {booking.guests > 1 ? "s" : ""}
          </span>
        </div>
        {booking.requests && (
          <p className="mt-3 rounded-lg bg-secondary/70 px-3 py-2 text-xs text-navy">
            “{booking.requests}”
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="font-display text-2xl text-navy">
            {formatINR(booking.total)}{" "}
            <span className="font-sans text-xs text-muted-foreground">
              paid {formatINR(booking.amountPaid)}
            </span>
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link to="/invoice/$bookingId" params={{ bookingId: booking.id }}>
                <FileText /> Invoice
              </Link>
            </Button>
            {open && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:bg-danger-soft hover:text-destructive"
                    disabled={!cancellable}
                    title={cancellable ? "" : "Online cancellation closes 48 hours before check-in"}
                  >
                    <XCircle /> Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl text-navy">
                      Cancel booking {booking.id}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Your {cat.name} stay on {formatDate(booking.checkIn)} will be cancelled.
                      {booking.amountPaid > 0
                        ? ` Your advance of ${formatINR(booking.amountPaid)} will be marked for refund (demo).`
                        : ""}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep booking</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        setBookingStatus(booking.id, "Cancelled");
                        toast.success("Booking cancelled");
                      }}
                    >
                      Yes, cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        {open && !cancellable && (
          <p className="mt-2 text-[0.7rem] text-muted-foreground">
            Online cancellation closes 48 hours before check-in — please contact reception.
          </p>
        )}
      </div>
    </motion.article>
  );
}
