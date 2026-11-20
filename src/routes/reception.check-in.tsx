import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { selectCls } from "@/components/dashboard/BookingDialog";
import { EmptyState, FilterChips, Panel, SearchInput } from "@/components/dashboard/ui";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR, todayISO } from "@/lib/hotel/pricing";
import { checkInBooking, freeRoomsFor, getCategory, useHotelState } from "@/lib/hotel/store";
import type { Booking } from "@/lib/hotel/types";

export const Route = createFileRoute("/reception/check-in")({
  component: CheckIn,
});

const VIEWS = ["Due today", "Upcoming"] as const;

function CheckIn() {
  const state = useHotelState();
  const today = todayISO();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Due today");
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = state.bookings
    .filter((b) => b.status === "Pending" || b.status === "Confirmed")
    .filter((b) =>
      view === "Due today" ? b.checkIn <= today && b.checkOut > today : b.checkIn > today,
    )
    .filter(
      (b) =>
        !term ||
        b.guestName.toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term) ||
        b.phone.includes(term),
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  return (
    <Panel
      title="Arrivals"
      subtitle="Assign a room and check guests in"
      action={
        <div className="flex flex-wrap items-center gap-3">
          <FilterChips options={VIEWS} value={view} onChange={setView} />
          <SearchInput value={q} onChange={setQ} placeholder="Search guest or booking ID" />
        </div>
      }
    >
      {list.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No arrivals waiting"
          text={
            view === "Due today"
              ? "Everyone due today is already checked in."
              : "No upcoming arrivals match."
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((b, i) => (
              <ArrivalCard key={b.id} booking={b} index={i} canCheckIn={view === "Due today"} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Panel>
  );
}

function ArrivalCard({
  booking: b,
  index,
  canCheckIn,
}: {
  booking: Booking;
  index: number;
  canCheckIn: boolean;
}) {
  const state = useHotelState();
  const free = freeRoomsFor(state, b.categoryId);
  const [room, setRoom] = useState(
    b.roomNumber && free.includes(b.roomNumber) ? b.roomNumber : (free[0] ?? ""),
  );
  const cat = getCategory(state, b.categoryId);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.35 } }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border p-5 transition-shadow hover:shadow-card"
    >
      <div className="flex items-start gap-4">
        <img src={cat.image} alt="" className="size-16 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-xl text-navy">{b.guestName}</p>
            <StatusBadge status={b.status} />
            <PaymentBadge status={b.payment} />
          </div>
          <p className="text-xs text-muted-foreground">
            {b.id} · {b.phone}
          </p>
          <p className="mt-1 text-sm text-navy">
            {cat.name} × {b.rooms} · {b.guests} guests ·{" "}
            {formatDate(b.checkIn, { day: "numeric", month: "short" })} →{" "}
            {formatDate(b.checkOut, { day: "numeric", month: "short" })}
          </p>
          {b.requests && <p className="mt-1 text-xs text-gold">“{b.requests}”</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Balance {formatINR(Math.max(0, b.total - b.amountPaid))}
          </p>
        </div>
      </div>
      {canCheckIn && (
        <div className="mt-4 flex gap-2">
          <select className={selectCls} value={room} onChange={(e) => setRoom(e.target.value)}>
            {free.length === 0 && <option value="">No clean {cat.name} free</option>}
            {free.map((r) => (
              <option key={r} value={r}>
                Room {r}
              </option>
            ))}
          </select>
          <Button
            variant="gold"
            disabled={!room}
            onClick={() => {
              checkInBooking(b.id, room);
              toast.success(`${b.guestName} checked in to room ${room}`);
            }}
          >
            <LogIn /> Check in
          </Button>
        </div>
      )}
    </motion.div>
  );
}
