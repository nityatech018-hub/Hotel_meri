import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, History } from "lucide-react";
import { useState } from "react";
import { EmptyState, FilterChips, Panel, rowMotion } from "@/components/dashboard/ui";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import { formatDate, formatINR, nightsBetween, todayISO } from "@/lib/hotel/pricing";
import { getCategory, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/history")({
  component: GuestHistory,
});

const FILTERS = ["All", "Checked-Out", "Cancelled"] as const;

function GuestHistory() {
  const state = useHotelState();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const today = todayISO();
  const list = state.bookings
    .filter(
      (b) =>
        b.email === state.session!.email &&
        (b.status === "Checked-Out" || b.status === "Cancelled" || b.checkOut < today),
    )
    .filter((b) => f === "All" || b.status === f)
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <Panel
      title="Past stays"
      subtitle="Completed and cancelled bookings"
      action={<FilterChips options={FILTERS} value={f} onChange={setF} />}
    >
      {list.length === 0 ? (
        <EmptyState
          icon={History}
          title="No past stays"
          text="Once you've stayed with us, your history appears here."
        />
      ) : (
        <div className="relative space-y-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-px before:bg-gold/40">
          {list.map((b, i) => {
            const c = getCategory(state, b.categoryId);
            return (
              <motion.div key={b.id} {...rowMotion(i)} className="relative">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, type: "spring" }}
                  className="absolute top-5 -left-[1.4rem] size-3 rounded-full border-2 border-card bg-gold"
                />
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4 transition hover:border-gold/60 hover:bg-accent/30">
                  <img src={c.image} alt="" className="size-16 rounded-lg object-cover" />
                  <div className="min-w-40 flex-1">
                    <p className="font-display text-xl text-navy">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.id} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ·{" "}
                      {nightsBetween(b.checkIn, b.checkOut)} nights
                      {b.roomNumber ? ` · Room ${b.roomNumber}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.payment} />
                  </div>
                  <p className="w-24 text-right font-display text-xl text-navy">
                    {formatINR(b.total)}
                  </p>
                  <Link
                    to="/invoice/$bookingId"
                    params={{ bookingId: b.id }}
                    className="flex items-center gap-1 text-sm text-gold hover:underline"
                  >
                    <FileText className="size-4" /> Invoice
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
