import { Link } from "@tanstack/react-router";
import { FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PaymentBadge, StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, formatINR, quoteStay } from "@/lib/hotel/pricing";
import {
  availableUnits,
  freeRoomsFor,
  getCategory,
  recordPayment,
  setBookingStatus,
  updateBooking,
  useHotelState,
} from "@/lib/hotel/store";
import type { Booking, BookingStatus, CategoryId } from "@/lib/hotel/types";

export const STATUSES: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Checked-In",
  "Checked-Out",
  "Cancelled",
];

export const selectCls =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25";

/** View & edit one booking: details, dates, room, status and payments. */
export function BookingDialog({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const state = useHotelState();
  const live = booking ? (state.bookings.find((b) => b.id === booking.id) ?? booking) : null;
  const [form, setForm] = useState<Booking | null>(live);
  const [pay, setPay] = useState("");

  useEffect(() => {
    setForm(live);
    setPay("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  if (!live || !form) return <Dialog open={false} />;
  const cat = getCategory(state, form.categoryId);
  const q = quoteStay(cat.price, form.checkIn, form.checkOut, form.rooms, state.settings.taxRate);
  const left = availableUnits(state, form.categoryId, form.checkIn, form.checkOut, live.id);
  const free = freeRoomsFor(state, form.categoryId);
  const roomOptions =
    form.roomNumber && !free.includes(form.roomNumber) ? [form.roomNumber, ...free] : free;
  const set = <K extends keyof Booking>(k: K, v: Booking[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  function save() {
    if (!form || !live) return;
    if (form.checkOut <= form.checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (form.status !== live.status) setBookingStatus(live.id, form.status);
    updateBooking(live.id, {
      guestName: form.guestName,
      phone: form.phone,
      email: form.email,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      guests: form.guests,
      rooms: form.rooms,
      categoryId: form.categoryId,
      roomNumber: form.roomNumber || undefined,
    });
    toast.success(`Booking ${live.id} updated`);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <p className="text-xs tracking-wider text-gold uppercase">
            {live.source} booking · created {live.createdAt}
          </p>
          <DialogTitle className="font-display text-3xl font-normal text-navy">
            {live.id}
          </DialogTitle>
          <DialogDescription className="flex gap-2">
            <StatusBadge status={live.status} />
            <PaymentBadge status={live.payment} />
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Guest name</Label>
            <Input value={form.guestName} onChange={(e) => set("guestName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Check-in</Label>
            <Input
              type="date"
              value={form.checkIn}
              onChange={(e) => {
                set("checkIn", e.target.value);
                if (e.target.value >= form.checkOut) set("checkOut", addDays(e.target.value, 1));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Check-out</Label>
            <Input
              type="date"
              min={addDays(form.checkIn, 1)}
              value={form.checkOut}
              onChange={(e) => set("checkOut", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Room category</Label>
            <select
              className={selectCls}
              value={form.categoryId}
              onChange={(e) => {
                set("categoryId", e.target.value as CategoryId);
                set("roomNumber", undefined);
              }}
            >
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned room</Label>
            <select
              className={selectCls}
              value={form.roomNumber ?? ""}
              onChange={(e) => set("roomNumber", e.target.value || undefined)}
            >
              <option value="">Not assigned</option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  Room {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              value={form.guests}
              onChange={(e) => set("guests", Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rooms</Label>
            <Input
              type="number"
              min={1}
              max={4}
              value={form.rooms}
              onChange={(e) => set("rooms", Math.min(4, Math.max(1, Number(e.target.value))))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Booking status</Label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${form.status === s ? "border-navy bg-navy text-champagne" : "border-border text-muted-foreground hover:border-gold"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        {left < form.rooms && form.status !== "Cancelled" && (
          <p className="rounded-lg bg-warning-soft p-3 text-sm text-warning">
            Only {left} {cat.name} available for these dates.
          </p>
        )}
        <div className="rounded-xl bg-secondary/60 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">New total ({q.nights} nights)</span>
            <span className="font-display text-xl text-navy">{formatINR(q.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid so far</span>
            <span className="text-success">{formatINR(live.amountPaid)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Record payment ₹"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              className="bg-card"
            />
            <Button
              variant="navy"
              disabled={!Number(pay)}
              onClick={() => {
                recordPayment(live.id, Number(pay));
                setPay("");
                toast.success("Payment recorded");
              }}
            >
              Record
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <Button asChild variant="outline">
            <Link to="/invoice/$bookingId" params={{ bookingId: live.id }}>
              <FileText /> Invoice
            </Link>
          </Button>
          <Button variant="gold" onClick={save}>
            <Save /> Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
