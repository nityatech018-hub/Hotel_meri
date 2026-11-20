import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  Crown,
  IndianRupee,
  LifeBuoy,
  Moon,
  Sparkles,
} from "lucide-react";
import { daysUntil, GuestBookingCard } from "@/components/dashboard/GuestBookingCard";
import { EmptyState, Panel, StatCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { IMG } from "@/lib/hotel/images";
import { formatDate, nightsBetween, todayISO } from "@/lib/hotel/pricing";
import { getCategory, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/")({
  component: GuestHome,
});

function GuestHome() {
  const state = useHotelState();
  const session = state.session!;
  const today = todayISO();
  const mine = state.bookings.filter((b) => b.email === session.email);
  const upcoming = mine
    .filter((b) => ["Pending", "Confirmed", "Checked-In"].includes(b.status) && b.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const stayed = mine.filter((b) => b.status === "Checked-Out");
  const nights = stayed.reduce((n, b) => n + nightsBetween(b.checkIn, b.checkOut), 0);
  const spent = mine.filter((b) => b.status !== "Cancelled").reduce((n, b) => n + b.amountPaid, 0);
  const next = upcoming[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-navy p-7 text-navy-foreground shadow-lift md:p-10"
      >
        <motion.img
          src={IMG.pool}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        <motion.div
          className="absolute -top-10 -right-10 size-48 rounded-full border border-gold/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative max-w-xl">
          <p className="eyebrow ornament text-champagne">
            <Sparkles className="size-3.5" /> {greet}
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl">
            Welcome,{" "}
            <em className="text-gold-gradient animate-shine">{session.name.split(" ")[0]}</em>
          </h2>
          <p className="mt-3 text-navy-foreground/75">
            {next
              ? next.status === "Checked-In"
                ? `You're staying with us until ${formatDate(next.checkOut)}. Enjoy every moment.`
                : `Your next stay begins ${daysUntil(next.checkIn) === 0 ? "today" : `in ${daysUntil(next.checkIn)} day${daysUntil(next.checkIn) === 1 ? "" : "s"}`} — ${getCategory(state, next.categoryId).name}, ${formatDate(next.checkIn)}.`
              : "No upcoming stays yet. Let us plan your next royal escape."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="xl">
              <Link to="/account/book" search={{}}>
                Book a room
              </Link>
            </Button>
            <Button asChild variant="outlineLight" size="xl">
              <Link to="/account/bookings">My bookings</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          index={0}
          icon={CalendarCheck}
          label="Upcoming stays"
          value={upcoming.length}
          tone="navy"
        />
        <StatCard index={1} icon={Moon} label="Nights stayed" value={nights} tone="info" />
        <StatCard
          index={2}
          icon={IndianRupee}
          label="Total paid"
          prefix="₹"
          value={spent}
          tone="success"
        />
        <StatCard
          index={3}
          icon={Crown}
          label="Royal points"
          value={Math.floor(spent / 100)}
          hint="1 point per ₹100 (demo)"
          tone="gold"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Upcoming reservations"
          subtitle="Check-in dates, room and status"
          className="xl:col-span-2"
          delay={0.15}
          action={
            <Link
              to="/account/bookings"
              className="flex items-center gap-1 text-sm text-gold hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState
              icon={BedDouble}
              title="No upcoming stays"
              text="Your future reservations will appear here."
              action={
                <Button asChild variant="navy">
                  <Link to="/account/book" search={{}}>
                    Find a room
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {upcoming.slice(0, 3).map((b, i) => (
                <GuestBookingCard key={b.id} booking={b} index={i} />
              ))}
            </div>
          )}
        </Panel>
        <div className="space-y-6">
          <Panel title="Quick actions" delay={0.25}>
            <div className="grid gap-2">
              {[
                { to: "/account/book" as const, label: "Search & book rooms", icon: BedDouble },
                {
                  to: "/account/payments" as const,
                  label: "View payment status",
                  icon: IndianRupee,
                },
                { to: "/account/support" as const, label: "Contact reception", icon: LifeBuoy },
              ].map((a, i) => (
                <motion.div
                  key={a.to}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                >
                  <Link
                    to={a.to}
                    className="group flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-gold hover:bg-accent/40"
                  >
                    <span className="grid size-9 place-items-center rounded-lg bg-navy text-gold transition group-hover:rotate-6">
                      <a.icon className="size-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-navy">{a.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-gold" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </Panel>
          <Panel title="Hotel timings" delay={0.35}>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Check-in</dt>
                <dd className="font-medium text-navy">{state.settings.checkInTime}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Check-out</dt>
                <dd className="font-medium text-navy">{state.settings.checkOutTime}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reception</dt>
                <dd className="font-medium text-navy">24 hours</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
