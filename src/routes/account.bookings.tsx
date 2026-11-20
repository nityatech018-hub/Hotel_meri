import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { CalendarX } from "lucide-react";
import { useState } from "react";
import { GuestBookingCard } from "@/components/dashboard/GuestBookingCard";
import { EmptyState, FilterChips, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { FREE_CANCEL_DAYS, todayISO } from "@/lib/hotel/pricing";
import { useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/bookings")({
  component: GuestBookings,
});

const FILTERS = ["All", "Pending", "Confirmed", "Checked-In"] as const;

function GuestBookings() {
  const state = useHotelState();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const today = todayISO();
  const list = state.bookings
    .filter(
      (b) =>
        b.email === state.session!.email &&
        ["Pending", "Confirmed", "Checked-In"].includes(b.status) &&
        b.checkOut >= today,
    )
    .filter((b) => f === "All" || b.status === f)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  return (
    <Panel
      title="Upcoming & current stays"
      subtitle={`Free online cancellation up to ${FREE_CANCEL_DAYS * 24} hours before check-in (demo rule).`}
      action={<FilterChips options={FILTERS} value={f} onChange={setF} />}
    >
      {list.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Nothing here yet"
          text="You have no reservations in this view."
          action={
            <Button asChild variant="navy">
              <Link to="/account/book" search={{}}>
                Book a room
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {list.map((b, i) => (
              <GuestBookingCard key={b.id} booking={b} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Panel>
  );
}
