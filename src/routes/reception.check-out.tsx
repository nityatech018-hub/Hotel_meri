import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, FilterChips, Panel } from "@/components/dashboard/ui";
import { PaymentBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR, todayISO } from "@/lib/hotel/pricing";
import { checkOutBooking, getCategory, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/reception/check-out")({
  component: CheckOut,
});

const VIEWS = ["Due today", "All in-house"] as const;

function CheckOut() {
  const state = useHotelState();
  const today = todayISO();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Due today");
  const list = state.bookings
    .filter((b) => b.status === "Checked-In")
    .filter((b) => view === "All in-house" || b.checkOut <= today)
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut));

  return (
    <Panel
      title="Departures"
      subtitle="Settle the balance and check guests out — the room moves to cleaning"
      action={<FilterChips options={VIEWS} value={view} onChange={setView} />}
    >
      {list.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No departures"
          text={
            view === "Due today" ? "No guests are due to check out today." : "No guests in house."
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="py-3">Room</th>
                <th>Guest</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Balance</th>
                <th>Payment</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {list.map((b, i) => {
                  const bal = Math.max(0, b.total - b.amountPaid);
                  const late = b.checkOut < today;
                  return (
                    <motion.tr
                      key={b.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/60 hover:bg-accent/30"
                    >
                      <td className="py-3">
                        <span className="rounded-lg bg-navy px-2.5 py-1 font-display text-lg text-gold">
                          {b.roomNumber ?? "—"}
                        </span>
                      </td>
                      <td>
                        <p className="text-navy">{b.guestName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategory(state, b.categoryId).name} · {b.id}
                        </p>
                      </td>
                      <td className={late ? "text-destructive" : "text-navy"}>
                        {formatDate(b.checkOut, { day: "numeric", month: "short" })}
                        {late && <span className="block text-xs">Overdue</span>}
                      </td>
                      <td className="text-navy">{formatINR(b.total)}</td>
                      <td className={bal > 0 ? "font-medium text-warning" : "text-success"}>
                        {formatINR(bal)}
                      </td>
                      <td>
                        <PaymentBadge status={b.payment} />
                      </td>
                      <td className="text-right">
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => {
                            checkOutBooking(b.id);
                            toast.success(
                              `${b.guestName} checked out${bal ? ` · ${formatINR(bal)} collected` : ""}`,
                            );
                          }}
                        >
                          <LogOut /> {bal > 0 ? `Collect & check out` : "Check out"}
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
