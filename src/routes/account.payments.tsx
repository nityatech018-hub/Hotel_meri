import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CreditCard, FileText, IndianRupee, Wallet } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, Panel, StatCard, rowMotion } from "@/components/dashboard/ui";
import { PaymentBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/hotel/pricing";
import { getCategory, recordPayment, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/payments")({
  component: GuestPayments,
});

function GuestPayments() {
  const state = useHotelState();
  const mine = state.bookings
    .filter((b) => b.email === state.session!.email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const live = mine.filter((b) => b.status !== "Cancelled");
  const paid = live.reduce((n, b) => n + b.amountPaid, 0);
  const due = live.reduce((n, b) => n + Math.max(0, b.total - b.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          icon={Wallet}
          label="Total paid"
          prefix="₹"
          value={paid}
          tone="success"
        />
        <StatCard
          index={1}
          icon={IndianRupee}
          label="Balance due"
          prefix="₹"
          value={due}
          tone="warning"
        />
        <StatCard
          index={2}
          icon={CreditCard}
          label="Transactions"
          value={mine.length}
          tone="navy"
        />
      </div>
      <Panel
        title="Payment status"
        subtitle="Demo payments — no real money is charged"
        delay={0.15}
      >
        {mine.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr className="border-b border-border">
                  <th className="py-3">Booking</th>
                  <th>Stay</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((b, i) => {
                  const balance = Math.max(0, b.total - b.amountPaid);
                  return (
                    <motion.tr
                      key={b.id}
                      {...rowMotion(i)}
                      className="border-b border-border/60 transition-colors hover:bg-accent/30"
                    >
                      <td className="py-3">
                        <p className="font-medium text-navy">{b.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategory(state, b.categoryId).name}
                        </p>
                      </td>
                      <td className="text-muted-foreground">
                        {formatDate(b.checkIn, { day: "numeric", month: "short" })} →{" "}
                        {formatDate(b.checkOut, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="text-navy">{formatINR(b.total)}</td>
                      <td className="text-navy">{formatINR(b.amountPaid)}</td>
                      <td>
                        <PaymentBadge status={b.payment} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {balance > 0 && b.status !== "Cancelled" && (
                            <Button
                              size="sm"
                              variant="gold"
                              className="rounded-full"
                              onClick={() => {
                                recordPayment(b.id, balance);
                                toast.success(`Paid ${formatINR(balance)} (demo)`);
                              }}
                            >
                              Pay {formatINR(balance)}
                            </Button>
                          )}
                          <Button asChild size="sm" variant="ghost" className="rounded-full">
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
