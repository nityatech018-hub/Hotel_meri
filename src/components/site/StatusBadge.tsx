import type { BookingStatus, PaymentStatus } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

const BOOKING: Record<BookingStatus, string> = {
  Pending: "bg-warning-soft text-warning",
  Confirmed: "bg-info-soft text-info",
  "Checked-In": "bg-success-soft text-success",
  "Checked-Out": "bg-muted text-muted-foreground",
  Cancelled: "bg-danger-soft text-destructive",
};
const PAYMENT: Record<PaymentStatus, string> = {
  Paid: "bg-success-soft text-success",
  Partial: "bg-warning-soft text-warning",
  Unpaid: "bg-danger-soft text-destructive",
  Refunded: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        BOOKING[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        PAYMENT[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
