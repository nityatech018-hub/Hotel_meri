import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Pencil, SearchX, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingDialog, STATUSES } from "@/components/dashboard/BookingDialog";
import { EmptyState, FilterChips, Panel, SearchInput } from "@/components/dashboard/ui";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/hotel/pricing";
import { getCategory, setBookingStatus, useHotelState } from "@/lib/hotel/store";
import type { Booking } from "@/lib/hotel/types";

export const Route = createFileRoute("/reception/bookings")({
  component: AllBookings,
});

const FILTERS = ["All", ...STATUSES] as const;
const PAGE = 15;

function AllBookings() {
  const state = useHotelState();
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [edit, setEdit] = useState<Booking | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const term = q.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  const list = [...state.bookings]
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
    .filter((b) => f === "All" || b.status === f)
    .filter(
      (b) =>
        !term ||
        b.guestName.toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term) ||
        (digits.length >= 3 && b.phone.replace(/\D/g, "").includes(digits)),
    );

  return (
    <>
      <Panel
        title="All bookings"
        subtitle={`${list.length} of ${state.bookings.length} bookings`}
        action={
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              setLimit(PAGE);
            }}
            placeholder="Search name, phone or booking ID"
          />
        }
      >
        <div className="mb-4">
          <FilterChips
            options={FILTERS}
            value={f}
            onChange={(v) => {
              setF(v);
              setLimit(PAGE);
            }}
          />
        </div>
        {list.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No bookings found"
            text="Try another name, phone number or booking ID."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr className="border-b border-border">
                  <th className="py-3">Booking</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Stay</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {list.slice(0, limit).map((b, i) => (
                    <motion.tr
                      key={b.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(i, 10) * 0.025 }}
                      className="border-b border-border/60 transition-colors hover:bg-accent/30"
                    >
                      <td className="py-3 font-medium text-navy">
                        {b.id}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {b.source}
                        </span>
                      </td>
                      <td>
                        <p className="text-navy">{b.guestName}</p>
                        <p className="text-xs text-muted-foreground">{b.phone}</p>
                      </td>
                      <td className="text-navy">
                        {getCategory(state, b.categoryId).name.replace(" Room", "")}
                        <span className="block text-xs text-muted-foreground">
                          {b.roomNumber ? `Room ${b.roomNumber}` : "Unassigned"}
                        </span>
                      </td>
                      <td className="text-muted-foreground">
                        {formatDate(b.checkIn, { day: "numeric", month: "short" })} →{" "}
                        {formatDate(b.checkOut, { day: "numeric", month: "short" })}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <PaymentBadge status={b.payment} />
                      </td>
                      <td className="text-navy">{formatINR(b.total)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit booking"
                            onClick={() => setEdit(b)}
                          >
                            <Pencil />
                          </Button>
                          <Button asChild size="icon" variant="ghost" aria-label="Invoice">
                            <Link to="/invoice/$bookingId" params={{ bookingId: b.id }}>
                              <FileText />
                            </Link>
                          </Button>
                          {(b.status === "Pending" || b.status === "Confirmed") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Cancel booking"
                              className="text-destructive hover:bg-danger-soft hover:text-destructive"
                              onClick={() => {
                                setBookingStatus(b.id, "Cancelled");
                                toast.success(`${b.id} cancelled`);
                              }}
                            >
                              <XCircle />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
        {list.length > limit && (
          <div className="mt-5 text-center">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setLimit((l) => l + PAGE)}
            >
              Show more ({list.length - limit} left)
            </Button>
          </div>
        )}
      </Panel>
      <BookingDialog booking={edit} onClose={() => setEdit(null)} />
    </>
  );
}
