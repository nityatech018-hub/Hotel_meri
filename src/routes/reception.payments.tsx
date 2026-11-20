import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertCircle, FileText, IndianRupee, Receipt, SearchX, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  EmptyState,
  FilterChips,
  Panel,
  SearchInput,
  StatCard,
  rowMotion,
} from "@/components/dashboard/ui";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/hotel/pricing";
import { recordPayment, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/reception/payments")({
  component: Payments,
});

const FILTERS = ["All", "Paid", "Partial", "Unpaid", "Refunded"] as const;

function Payments() {
  const state = useHotelState();
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const live = state.bookings.filter((b) => b.status !== "Cancelled");
  const collected = live.reduce((n, b) => n + b.amountPaid, 0);
  const due = live.reduce((n, b) => n + Math.max(0, b.total - b.amountPaid), 0);
  const refunded = state.bookings.filter((b) => b.payment === "Refunded").length;
  const term = q.trim().toLowerCase();
  const list = [...state.bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((b) => f === "All" || b.payment === f)
    .filter(
      (b) => !term || b.guestName.toLowerCase().includes(term) || b.id.toLowerCase().includes(term),
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          index={0}
          icon={Wallet}
          label="Collected"
          prefix="₹"
          value={collected}
          tone="success"
        />
        <StatCard
          index={1}
          icon={AlertCircle}
          label="Outstanding"
          prefix="₹"
          value={due}
          tone="warning"
        />
        <StatCard
          index={2}
          icon={IndianRupee}
          label="Unpaid bookings"
          value={live.filter((b) => b.payment === "Unpaid").length}
          tone="danger"
        />
        <StatCard index={3} icon={Receipt} label="Refunds" value={refunded} tone="info" />
      </div>
      <Panel
        title="Payment records"
        subtitle="Demo payments — no real transactions"
        delay={0.15}
        action={<SearchInput value={q} onChange={setQ} placeholder="Search guest or booking ID" />}
      >
        <div className="mb-4">
          <FilterChips options={FILTERS} value={f} onChange={setF} />
        </div>
        {list.length === 0 ? (
          <EmptyState icon={SearchX} title="No records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr className="border-b border-border">
                  <th className="py-3">Booking</th>
                  <th>Guest</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Payment</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 40).map((b, i) => {
                  const bal = Math.max(0, b.total - b.amountPaid);
                  return (
                    <motion.tr
                      key={b.id}
                      {...rowMotion(i)}
                      className="border-b border-border/60 hover:bg-accent/30"
                    >
                      <td className="py-3 font-medium text-navy">{b.id}</td>
                      <td className="text-navy">{b.guestName}</td>
                      <td className="text-muted-foreground">{formatDate(b.createdAt)}</td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="text-navy">{formatINR(b.total)}</td>
                      <td>
                        <p className="text-navy">{formatINR(b.amountPaid)}</p>
                        <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full bg-gold-gradient"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (b.amountPaid / b.total) * 100)}%` }}
                            transition={{ duration: 0.9, delay: 0.2 + Math.min(i, 12) * 0.03 }}
                          />
                        </div>
                      </td>
                      <td>
                        <PaymentBadge status={b.payment} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          {bal > 0 && b.status !== "Cancelled" && (
                            <Button
                              size="sm"
                              variant="navy"
                              onClick={() => {
                                recordPayment(b.id, bal);
                                toast.success(`${formatINR(bal)} recorded for ${b.id}`);
                              }}
                            >
                              Settle {formatINR(bal)}
                            </Button>
                          )}
                          <Button asChild size="icon" variant="ghost" aria-label="Invoice">
                            <Link to="/invoice/$bookingId" params={{ bookingId: b.id }}>
                              <FileText />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
