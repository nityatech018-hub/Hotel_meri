import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "@/components/dashboard/BookingDialog";
import { Panel, rowMotion } from "@/components/dashboard/ui";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { addDays, formatDate, parseISODate, todayISO } from "@/lib/hotel/pricing";
import { roomsBookedOn } from "@/lib/hotel/reports";
import { getCategory, useHotelState } from "@/lib/hotel/store";
import type { Booking } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reception/calendar")({
  component: CalendarPage,
});

const DAYS = 14;

function CalendarPage() {
  const state = useHotelState();
  const today = todayISO();
  const [start, setStart] = useState(today);
  const [day, setDay] = useState(today);
  const [edit, setEdit] = useState<Booking | null>(null);
  const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));
  const onDay = state.bookings.filter(
    (b) => b.status !== "Cancelled" && b.checkIn <= day && day < b.checkOut,
  );
  const arriving = state.bookings.filter((b) => b.status !== "Cancelled" && b.checkIn === day);

  return (
    <div className="space-y-6">
      <Panel
        title="Availability calendar"
        subtitle="Rooms booked per category per night · click a day for details"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setStart(addDays(start, -7))}
              aria-label="Previous week"
            >
              <ChevronLeft />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStart(today);
                setDay(today);
              }}
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setStart(addDays(start, 7))}
              aria-label="Next week"
            >
              <ChevronRight />
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="w-32 text-left font-normal text-muted-foreground">Category</th>
                {days.map((d) => {
                  const dt = parseISODate(d);
                  return (
                    <th key={d}>
                      <button
                        onClick={() => setDay(d)}
                        className={cn(
                          "w-full rounded-lg py-1.5 transition",
                          d === day
                            ? "bg-navy text-champagne"
                            : d === today
                              ? "bg-accent text-navy"
                              : "text-muted-foreground hover:bg-accent/60",
                        )}
                      >
                        <span className="block text-[0.6rem] uppercase">
                          {dt.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="font-display text-base">{dt.getDate()}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {state.categories.map((c, ri) => {
                const total = state.rooms.filter(
                  (r) => r.categoryId === c.id && r.status !== "maintenance",
                ).length;
                return (
                  <tr key={c.id}>
                    <td className="pr-2 font-medium text-navy">
                      {c.name.replace(" Room", "")}
                      <span className="block text-[0.65rem] font-normal text-muted-foreground">
                        {total} rooms
                      </span>
                    </td>
                    {days.map((d, ci) => {
                      const used = roomsBookedOn(state.bookings, d, c.id);
                      const pct = total ? Math.min(1, used / total) : 1;
                      return (
                        <td key={d}>
                          <motion.button
                            key={start + d}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: ri * 0.04 + ci * 0.015 }}
                            onClick={() => setDay(d)}
                            title={`${used}/${total} booked`}
                            className={cn(
                              "grid h-11 w-full place-items-center rounded-lg font-medium transition hover:ring-2 hover:ring-gold",
                              pct >= 1
                                ? "bg-navy text-champagne"
                                : pct >= 0.6
                                  ? "bg-gold text-gold-foreground"
                                  : pct > 0
                                    ? "bg-champagne/60 text-navy"
                                    : "bg-muted text-muted-foreground",
                              d === day && "ring-2 ring-navy",
                            )}
                          >
                            {used}/{total}
                          </motion.button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {[
            ["bg-muted", "Empty"],
            ["bg-champagne/60", "Some booked"],
            ["bg-gold", "Filling up"],
            ["bg-navy", "Full"],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded", c)} />
              {l}
            </span>
          ))}
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          key={"stay" + day}
          title={`In house on ${formatDate(day, { day: "numeric", month: "short" })}`}
          subtitle={`${onDay.length} bookings`}
        >
          <BookingList items={onDay} onOpen={setEdit} />
        </Panel>
        <Panel
          key={"arr" + day}
          title="Arrivals that day"
          subtitle={`${arriving.length} bookings`}
          delay={0.1}
        >
          <BookingList items={arriving} onOpen={setEdit} />
        </Panel>
      </div>
      <BookingDialog booking={edit} onClose={() => setEdit(null)} />
    </div>
  );
}

function BookingList({ items, onOpen }: { items: Booking[]; onOpen: (b: Booking) => void }) {
  const state = useHotelState();
  if (!items.length)
    return <p className="py-6 text-center text-sm text-muted-foreground">No bookings.</p>;
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {items.map((b, i) => (
        <motion.li key={b.id} {...rowMotion(i)}>
          <button
            onClick={() => onOpen(b)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left text-sm transition hover:border-gold"
          >
            <div>
              <p className="text-navy">{b.guestName}</p>
              <p className="text-xs text-muted-foreground">
                {getCategory(state, b.categoryId).name}
                {b.roomNumber ? ` · Room ${b.roomNumber}` : ""} · {b.id}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
